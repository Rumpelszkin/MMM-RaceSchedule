const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const xml2js = require("xml2js");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-RaceSchedule node_helper started");
  },

  // Handle fetching race schedule data.
  fetchRaceSchedule: function (apiUrl) {
    const self = this;
    fetch(apiUrl)
      .then((response) => response.text())
      .then((xmlData) => {
        // Parse XML data into JavaScript object.
        xml2js.parseString(xmlData, (err, result) => {
          if (err) {
            console.error("Error parsing XML:", err);
            self.sendSocketNotification("RACE_SCHEDULE_ERROR", err);
            return;
          }
          if (
            result.MRData &&
            result.MRData.RaceTable &&
            result.MRData.RaceTable.Race
          ) {
            // Extract race schedule data from parsed XML.
            const raceSchedule = result.MRData.RaceTable.Race.map((race) => {
              return {
                name: race.RaceName[0],
                circuitName: race.Circuit[0].CircuitName[0],
                locality: race.Circuit[0].Location[0].Locality[0],
                country: race.Circuit[0].Location[0].Country[0],
                date: race.Date[0],
                time: race.Time[0],
                practice1: {
                  date: race.FirstPractice[0].Date[0],
                  time: race.FirstPractice[0].Time[0],
                },
                practice2: {
                  date: race.SecondPractice[0].Date[0],
                  time: race.SecondPractice[0].Time[0],
                },
                practice3: {
                  date: race.ThirdPractice[0].Date[0],
                  time: race.ThirdPractice[0].Time[0],
                },
                qualifying: {
                  date: race.Qualifying[0].Date[0],
                  time: race.Qualifying[0].Time[0],
                },
              };
            });
            self.sendSocketNotification("RACE_SCHEDULE_DATA", raceSchedule);
          } else {
            console.error("Invalid XML format:", result);
            self.sendSocketNotification("RACE_SCHEDULE_ERROR", "Invalid XML format");
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching race schedule:", error);
        self.sendSocketNotification("RACE_SCHEDULE_ERROR", error);
      });
  },

  // Override socketNotificationReceived method.
  socketNotificationReceived: function (notification, payload) {
    if (notification === "FETCH_RACE_SCHEDULE") {
      this.fetchRaceSchedule(payload.apiUrl);
    }
  },
});