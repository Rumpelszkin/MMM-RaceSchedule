Module.register("MMM-RaceSchedule", {
    // Default module config.
    defaults: {
      apiUrl: "http://ergast.com/api/f1/2024",
      updateInterval: 60 * 60 * 1000, // 1 hour
    },
  
    // Override start method.
    start: function () {
      this.schedule = [];
      this.sendSocketNotification("FETCH_RACE_SCHEDULE", { apiUrl: this.config.apiUrl });
      this.scheduleUpdate();
    },
  
    // Override notification handler.
    notificationReceived: function (notification, payload, sender) {
      if (notification === "MODULE_DOM_CREATED") {
        // Module's DOM is created.
        this.updateDom();
      }
    },
  
    // Override scheduler.
    scheduleUpdate: function () {
      const self = this;
      setInterval(() => {
        self.sendSocketNotification("FETCH_RACE_SCHEDULE", { apiUrl: self.config.apiUrl });
      }, this.config.updateInterval);
    },
  
    // Override socket notification handler.
    socketNotificationReceived: function (notification, payload) {
      if (notification === "RACE_SCHEDULE_DATA") {
        this.schedule = payload;
        this.updateDom();
      } else if (notification === "RACE_SCHEDULE_ERROR") {
        console.error("Race schedule error:", payload);
        // Handle error if needed
      }
    },
  
    // Override dom generator.
    getDom: function () {
      const wrapper = document.createElement("div");
      if (this.schedule.length === 0) {
        wrapper.innerHTML = "Loading...";
        return wrapper;
      }
      // Display race schedule here.
      const table = document.createElement("table");
      table.className = "race-schedule-table";
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = "<th>Race</th><th>Circuit</th><th>Location</th><th>Date</th><th>Time</th><th>Practice 1</th><th>Practice 2</th><th>Practice 3</th><th>Qualifying</th>";
      table.appendChild(headerRow);
      this.schedule.forEach((race) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${race.name}</td><td>${race.circuitName}</td><td>${race.locality}, ${race.country}</td><td>${race.date}</td><td>${race.time}</td><td>${race.practice1.date} ${race.practice1.time}</td><td>${race.practice2.date} ${race.practice2.time}</td><td>${race.practice3.date} ${race.practice3.time}</td><td>${race.qualifying.date} ${race.qualifying.time}</td>`;
        table.appendChild(row);
      });
      wrapper.appendChild(table);
      return wrapper;
    },
  });