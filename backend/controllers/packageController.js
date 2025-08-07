const pool = require('../db');

exports.getPackages = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT package_name AS name, max_bots
      FROM package_discounts
      ORDER BY max_bots ASC
    `);

    const packages = result.rows.map((pkg, index) => ({
      id: index + 1,
      name: pkg.name,
      max_bots: pkg.max_bots,
    }));

    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getTimeDiscounts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT months, discount_multiplier
      FROM time_discounts
      ORDER BY months ASC
    `);

    res.json(result.rows); // Trả về dạng [{ months: 1, discount_multiplier: 1.0 }, ...]
  } catch (err) {
    console.error('Error fetching time discounts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.guestJoin = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      package_name,
      duration_months,
      selected_bot_ids,
      note = '',
    } = req.body;

    if (!full_name || !phone || !email || !duration_months || !Array.isArray(selected_bot_ids)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await pool.query(
      `INSERT INTO guest_join_requests (
        full_name, phone, email, package_name, duration_months, selected_bot_ids, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [full_name, phone, email, package_name, duration_months, JSON.stringify(selected_bot_ids), note]
    );

    res.status(200).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('Error saving guest join request:', err);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

exports.caculatePrice = async (req, res) => {
  const { selectedBotIds, package_name, months } = req.body;
  const userId = req.user?.id;

  if (!Array.isArray(selectedBotIds) || selectedBotIds.length === 0 || !package_name || !months) {
    return res.status(400).json({ error: 'Thiếu dữ liệu đầu vào.' });
  }

  try {
    // Lấy risk_level của từng bot
    const botRes = await pool.query(
      `SELECT id, risk_level FROM bots WHERE id = ANY($1::int[])`,
      [selectedBotIds]
    );
    const botRiskLevels = botRes.rows;

    if (botRiskLevels.length !== selectedBotIds.length) {
      return res.status(400).json({ error: 'Một số bot không hợp lệ.' });
    }

    // Lấy giá gốc theo risk_level
    const riskLevels = [...new Set(botRiskLevels.map(b => b.risk_level))];
    const priceRes = await pool.query(
      `SELECT risk_level, base_price_per_month FROM bot_risk_prices WHERE risk_level = ANY($1::int[])`,
      [riskLevels]
    );
    const riskPricesMap = {};
    priceRes.rows.forEach(p => {
      riskPricesMap[p.risk_level] = parseFloat(p.base_price_per_month);
    });

    // Lấy giảm giá gói
    const pkgRes = await pool.query(
      `SELECT discount_multiplier, max_bots FROM package_discounts WHERE package_name = $1`,
      [package_name]
    );

    if (pkgRes.rows.length === 0) {
      return res.status(400).json({ error: 'Gói không hợp lệ' });
    }

    const { discount_multiplier, max_bots } = pkgRes.rows[0];
    let packageDiscount = 1.0;

    if (selectedBotIds.length > max_bots) {
      return res.status(400).json({ error: `Gói ${package_name} chỉ cho phép tối đa ${max_bots} bot.` });
    }

    // ✅ Chỉ áp dụng discount nếu chọn đủ bot
    if (selectedBotIds.length === max_bots) {
      packageDiscount = parseFloat(discount_multiplier);
    }
    // Lấy giảm giá theo thời gian
    const timeRes = await pool.query(
      `SELECT discount_multiplier FROM time_discounts WHERE months = $1`,
      [months]
    );
    if (timeRes.rows.length === 0) {
      return res.status(400).json({ error: 'Thời gian không hợp lệ' });
    }

    const timeDiscount = parseFloat(timeRes.rows[0].discount_multiplier);

    // Tính tổng giá gốc + giảm giá
    const botsWithPrice = botRiskLevels.map(bot => {
      const basePrice = parseFloat(riskPricesMap[bot.risk_level]);
      return {
        bot_id: bot.id,
        price: basePrice * timeDiscount * packageDiscount * months,
      };
    });

    const total_price = botsWithPrice.reduce((sum, bot) => sum + bot.price, 0);

    return res.status(201).json({
      message: 'Đăng ký gói thành công.',
      total_price: Number(total_price.toFixed(3)),
      duration_months: months,
      package_name,
      bots: botsWithPrice,
    });

  } catch (err) {
    console.error('Lỗi xác nhận đăng ký:', err);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

exports.confirmSubscription = async (req, res) => {
  const userId = req.user.id;
  const { package_name, months, botsWithPrice } = req.body;

  if (!package_name || !months || !Array.isArray(botsWithPrice) || botsWithPrice.length === 0) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Tính tổng giá
    const totalPrice = botsWithPrice.reduce((sum, bot) => sum + parseFloat(bot.price), 0);

    // Kiểm tra số dư người dùng
    const userRes = await client.query('SELECT total_capital FROM user_profiles WHERE user_id = $1 FOR UPDATE', [userId]);
    if (userRes.rows.length === 0) {
      throw new Error('Không tìm thấy người dùng.');
    }

    const currentBalance = parseFloat(userRes.rows[0].total_capital);
    if (currentBalance < totalPrice) {
      return res.status(400).json({ error: 'Số dư không đủ.' });
    }

    // Tính ngày kết thúc
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Number(months));

    // Lưu subscription
    const subResult = await client.query(
      `INSERT INTO user_subscriptions (user_id, package_name, months, start_date, end_date, total_price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, package_name, months, startDate, endDate, totalPrice]
    );

    const subscriptionId = subResult.rows[0].id;

    // Lưu các bot
    for (const bot of botsWithPrice) {
      await client.query(
        `INSERT INTO user_subscription_bots (subscription_id, bot_id, price)
         VALUES ($1, $2, $3)`,
        [subscriptionId, bot.bot_id, bot.price]
      );
    }

    // Trừ tiền người dùng
    await client.query(
      `UPDATE user_profiles SET total_capital = total_capital - $1 WHERE user_id = $2`,
      [totalPrice, userId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Đăng ký thành công.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi xác nhận subscription:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi xử lý yêu cầu.' });
  } finally {
    client.release();
  }
};

exports.subscribeBot = async (req, res) => {
  const { username, botName } = req.params;
  const { months, final_price } = req.body;

  const client = await pool.connect(); // Lấy client từ pool

  try {
    await client.query('BEGIN'); // Bắt đầu transaction

    // 1. Lấy user và bot info
    const userRes = await client.query(
      `SELECT u.id, up.total_capital 
      FROM users u 
      JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.username = $1`,
      [username]
    );
    const botRes = await client.query(
      `SELECT id FROM bots WHERE name = $1`,
      [botName]
    );

    if (userRes.rowCount === 0 || botRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User or bot not found' });
    }

    const userId = userRes.rows[0].id;
    const botId = botRes.rows[0].id;
    const userBalance = parseFloat(userRes.rows[0].total_capital);

    if (userBalance < final_price) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Not enough balance' });
    }

    // 2. Lấy các gói subscriptions còn hạn
    const activeSubsRes = await client.query(`
      SELECT 
        us.id, 
        us.package_name, 
        us.months,
        us.end_date,
        pd.max_bots,
        COUNT(usb.id) AS used_slots
      FROM user_subscriptions us
      JOIN package_discounts pd ON us.package_name = pd.package_name
      LEFT JOIN user_subscription_bots usb ON usb.subscription_id = us.id
      WHERE us.user_id = $1 AND us.end_date > CURRENT_DATE
      GROUP BY us.id, pd.max_bots
      ORDER BY us.end_date ASC
    `, [userId]);

    // 3. Tìm gói còn slot
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Number(months));

    let assignedSubId = null;
    for (const sub of activeSubsRes.rows) {
      const subEndDate = new Date(sub.end_date);

      // Nếu còn slot và thời hạn >= gói mới thì dùng lại
      if (parseInt(sub.used_slots) < sub.max_bots && subEndDate >= endDate) {
        assignedSubId = sub.id;
        break;
      }
    }

    // 4. Nếu không có thì tạo mới
    if (!assignedSubId) {
      const pkgRes = await client.query(
        `SELECT 
          pd.package_name, pd.max_bots, pd.discount_multiplier AS package_discount
        FROM package_discounts pd
        WHERE pd.max_bots = $1`,
        [1]
      );
      if (pkgRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Invalid package' });
      }

      const { package_name, max_bots, package_discount } = pkgRes.rows[0];

      const newSubRes = await client.query(
        `INSERT INTO user_subscriptions (user_id, package_name, months, start_date, end_date, total_price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
        [userId, package_name, months, startDate, endDate, final_price]
      );

      assignedSubId = newSubRes.rows[0].id;
    }

    // 5. Gán bot vào subscription
    await client.query(
      `INSERT INTO user_subscription_bots (subscription_id, bot_id, price)
         VALUES ($1, $2, $3)`,
      [assignedSubId, botId, final_price]
    );

    // 6. Trừ tiền
    await client.query(
      `UPDATE user_profiles SET total_capital = total_capital - $1 WHERE user_id = $2`,
      [final_price, userId]
    );

    await client.query('COMMIT'); // Hoàn tất transaction

    return res.status(200).json({ message: 'Subscribed successfully' });

  } catch (err) {
    await client.query('ROLLBACK'); // Trả lại dữ liệu như cũ nếu lỗi
    console.error('Subscription failed:', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release(); // Trả client lại cho pool
  }
};