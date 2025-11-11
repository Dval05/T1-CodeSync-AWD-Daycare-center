$(function(){
  requireAuth();
  // Supón que usas fullcalendar.js aquí. Esto solo hace fetch e inserta datos al calendario:
  $('#activityCalendar').fullCalendar({
    events: function(start,end,timezone,callback){
      $.get(API_BASE_URL+"/activities/get_all.php",function(r){
        const events=r.data.map(a=>({
          title:a.Name, start:a.ScheduledDate, description:a.Description
        }));
        callback(events);
      });
    }
  });
});
