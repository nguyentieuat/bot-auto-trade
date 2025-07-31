import React from 'react';

// Component to display list of bots in grid or list view
const Bots = ({ botList = [], viewMode, onBotClick }) => {
  // Safety check: ensure botList is an array
  if (!Array.isArray(botList)) return null;

  // Show message if no bots are available
  if (botList.length === 0) {
    return (
      <div className="container text-light text-center py-5">
        <p>No bots available to display.</p>
      </div>
    );
  }

  // Render bots in Grid layout (3 per row)
  const renderGridView = () => {
    const rows = [];

    for (let i = 0; i < botList.length; i += 3) {
      const group = botList.slice(i, i + 3); // Group 3 bots together

      rows.push(
        <section className="py-5 text-center" key={`row-${i}`}>
          <div className="container">
            <div className="row g-4">
              {group.map((bot) => (
                <div
                  className="col-md-4"
                  key={bot.id}
                  onClick={() => onBotClick(bot.id)} // Trigger detail view
                  style={{ cursor: 'pointer' }}
                  title={`View details for ${bot.name}`}
                >
                  <div className="mb-2 text-light fw-bold">{bot.name}</div>
                  <video
                    className="w-100 rounded-4 shadow"
                    src={bot.src}
                    autoPlay
                    loop
                    playsInline
                    muted
                  >
                    <track
                      kind="captions"
                      src="path/to/captions.vtt"
                      srcLang="en"
                      label="English"
                      default
                    />
                  </video>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return rows;
  };

  // Render bots in List layout (one per row)
  const renderListView = () => (
    <section className="py-5 text-center">
      <div className="container">
        <div className="row g-4 flex-column align-items-center">
          {botList.map((bot) => (
            <div
              className="col-md-8"
              key={bot.id}
              onClick={() => onBotClick(bot.id)}
              style={{ cursor: 'pointer' }}
              title={`View details for ${bot.name}`}
            >
              <div className="mb-2 text-light fw-bold">{bot.name}</div>
              <video
                className="w-100 rounded-4 shadow"
                src={bot.src}
                autoPlay
                loop
                playsInline
                muted
              >
                <track
                  kind="captions"
                  src="path/to/captions.vtt"
                  srcLang="en"
                  label="English"
                  default
                />
              </video>

              {/* Optional short description */}
              {/* <p className="text-light small mt-2">{bot.description}</p> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Choose view mode based on prop
  return <>{viewMode === 'grid' ? renderGridView() : renderListView()}</>;
};

export default Bots;
