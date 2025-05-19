import { createChatBotMessage } from 'react-chatbot-kit';
import NavigateButton from '../NavigateButton';

const botName = "TravelBot";

const config = {
  botName,
  initialMessages: [createChatBotMessage(` Cайна байна уу! Би бол ${botName}. Таньд юугаар туслах вэ?`)],
  widgets: [
    {
      widgetName: "navigateTrip",
      widgetFunc: (props) => <NavigateButton {...props} />,
      mapStateToProps: ["image" , "tripId"],
    },
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: "rgb(103, 155, 249)",
    },
    chatButton: {
      backgroundColor: "rgb(103, 155, 249)",
    }
  },
  customProps: {}, 

};

export default config;
