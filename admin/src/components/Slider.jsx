import React from "react";
import Slider from "react-slick";
import { Card } from "antd";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const { Meta } = Card;

const SliderPlace = ({ places, onPlaceSelect, selectedPlace }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Ensure places is an array (handle case where it's a single object)
  const placesArray = Array.isArray(places) ? places : [places];

  return (
    <div
      className="slider-container"
      style={{ width: "100%", margin: "auto", paddingBottom: "20px" }}
    >
      <Slider {...settings}>
        {placesArray.map((place) => (
          <div
            key={place.id}
            style={{
              padding: "0 10px",
              paddingBottom: "20px",
            }}
          >
            <Card
              hoverable
              style={{
                width: 240,
                height: 200,
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                border:
                  selectedPlace === place.id ? "2px solid #1890ff" : "none", // Highlight selected place
              }}
              cover={
                <img
                  alt={place.title}
                  src={place.image_url}
                  style={{ height: 150, objectFit: "cover" }}
                />
              }
              onClick={() => onPlaceSelect(place.id)}
            >
              <Meta
                title={place.title || place.name}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
            </Card>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SliderPlace;
