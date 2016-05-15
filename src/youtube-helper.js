export let youtubeHelper = {
  getVideoDetailsForId: function(id, callback) {
    if (typeof callback !== "function") {
      callback = function(res) { console.log(res); };
    }

    var request = gapi.client.youtube.videos.list({
      id: id,
      fields: "items/snippet",
      part: 'snippet'
    });

    request.execute(function(result) {
      var details = result.items[0].snippet;
      callback(details);
    });
  }
};
