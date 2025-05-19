import React , {useEffect}from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";

import config from "./ChatbotConfig";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";

const ChatBotUI = () => {
    useEffect(() => {
        const header = document.querySelector('.react-chatbot-kit-chat-header');
        const input = document.querySelector('.react-chatbot-kit-chat-input-container');
        if (header) header.style.display = 'none';
        if (input) {
            input.style.marginLeft = '30px'
            input.style.border = '1px solid rgb(103, 155, 249)';
            input.style.borderRadius = '5px';
         } ;
      }, []);
    return (
        <div style={{ maxWidth: "400px" }}>
            <Chatbot
                config={config}
                messageParser={MessageParser}
                actionProvider={ActionProvider}
            />

        </div>
    );
};

export default ChatBotUI;