import axios from "axios";

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, navigate) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.navigate = navigate;
  }

  handleUserMessage = async (message) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost/api/trip/chat/",
        { message },
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (res.data && res.data.reply) {
        const reply = this.createChatBotMessage(res.data.reply);
        const updates = [reply];

        if (res.data.trip_id) {
          const buttonMessage = this.createChatBotMessage(
            "Та илүү дэлгэрэнгүй мэдээлэл авахыг хүсвэл дарна уу",
            {
              delay: 500,
              withAvatar: true,
              widget: 'navigateTrip',
              payload: { tripId: res.data.trip_id,
                image: res.data.image,
              },
            }
          );
          updates.push(buttonMessage);
        }
        this.setState((prev) => ({
          ...prev,
          messages: [...prev.messages,...updates],
        }));
      } 
     
    } catch (err) {
      const errorMsg = this.createChatBotMessage("Server error! Please try again later.");
      this.setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
      }));
    }
  };

  navigateToTrip = (tripId) => {
    this.navigate(`/trip/${tripId}`);
  };
}

export default ActionProvider;
