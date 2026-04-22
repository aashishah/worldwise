// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "../components/Message";

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState(null);

  const [lat, lng] = useUrlPosition();

  const [isLGC, setIsLGC] = useState(false);

  useEffect(
    function () {
      async function fetchCityData() {
        try {
          setIsLGC(true);
          setError(null);
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`,
          );
          const data = await res.json();
          if (!data.countryCode)
            throw new Error("Doesn't seem to be a city, click somewhere else.");
          setCityName(data.City || data.locality || "");
          setCountry(data.country);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLGC(false);
        }
      }

      fetchCityData();
    },
    [lat, lng],
  );

  if (error) return <Message message={error} />;

  return (
    <form className={styles.form}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <Button
          type="back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          &larr; Back
        </Button>
      </div>
    </form>
  );
}

export default Form;
