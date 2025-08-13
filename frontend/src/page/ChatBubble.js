import React, { useState } from 'react';

const ChatBubble = () => {
    const [open, setOpen] = useState(false);

    const toggleChatOptions = () => {
        setOpen(!open);
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 9999,
            }}
        >
            <div className="chat-actions" style={{ position: 'relative', width: '60px', height: '60px' }}>
                {/* Action buttons */}
                <a
                    href="https://m.me/nguyentieuat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`chat-action-btn ${open ? 'show' : ''}`}
                    style={{ '--angle': '0deg' }}
                >
                    <i className="fab fa-facebook-messenger text-primary"></i>
                </a>
                <a
                    href="https://zalo.me/0703081994"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`chat-action-btn ${open ? 'show' : ''}`}
                    style={{ '--angle': '45deg' }}
                >
                    <img src="/assets/icons/zalo.svg" alt="Zalo" style={{ width: 20 }} />
                </a>
                <a
                    href="https://t.me/nguyentieuat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`chat-action-btn ${open ? 'show' : ''}`}
                    style={{ '--angle': '90deg' }}
                >
                    <i className="fab fa-telegram text-info"></i>
                </a>

                {/* Main button */}
                <button
                    className="chat-main-btn btn btn-primary rounded-circle"
                    style={{ width: 60, height: 60, fontSize: 24 }}
                    onClick={toggleChatOptions}
                >
                    💬
                </button>
            </div>

            {/* Inline CSS */}
            <style>{`
        .chat-action-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #fff;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transform: translate(0, 0) scale(0);
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 0;
        }

        .chat-action-btn.show {
          opacity: 1;
          transform: translate(
            calc(-80px * cos(var(--angle))),
            calc(-80px * sin(var(--angle)))
          ) scale(1);
        }

        /* Enable trigonometric functions in CSS */
        @property --angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes shake {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(-10deg); }
            40% { transform: rotate(10deg); }
            60% { transform: rotate(-6deg); }
            80% { transform: rotate(6deg); }
            100% { transform: rotate(0deg); }
        }

        .chat-main-btn {
            animation: shake 0.5s ease-in-out infinite;
            animation-delay: 3s;
            animation-iteration-count: infinite;
            animation-direction: normal;
            animation-fill-mode: forwards;
            animation-play-state: running;
            animation-timing-function: ease-in-out;
            animation-name: shake;
            animation-duration: 0.5s;
            animation-delay: 3s;
            animation-iteration-count: infinite;
        }
        @media (max-width: 576px) {
            .chat-actions {
                width: 50px !important;
                height: 50px !important;
            }

            .chat-main-btn {
                width: 50px !important;
                height: 50px !important;
                font-size: 20px !important;
            }

            .chat-action-btn {
                width: 40px !important;
                height: 40px !important;
            }

            .chat-action-btn.show {
                transform: translate(
                calc(-60px * cos(var(--angle))),
                calc(-60px * sin(var(--angle)))
                ) scale(1);
            }
            }

      `}</style>
        </div>
    );
};

export default ChatBubble;
