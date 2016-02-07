<bob-view>

  <!-- the template -->
  <!-- notice that you have to use HTML comments up here lol -->

  <a onclick="{ addItem }">more bob</a>

  <div each={ key, text in opts.items }>
    <a onclick="{ parent.remove }">X</a><span>{ text }</span>
  </div>

  //
  // the logic
  //

  <script>
    // our bob
    var bob = "And just raise cain. Think about a cloud. Just float around and be there. Isn't that fantastic that you can create an almighty tree that fast? Each highlight must have it's own private shadow. Let's put some happy little clouds in our world. Isn't that fantastic? You can just push a little tree out of your brush like that. Let's go up in here, and start having some fun. You can get away with a lot. You don't have to be crazy to do this but it does help. The least little bit can do so much. I'm a water fanatic. I love water. We'll paint one happy little tree right here. That is when you can experience true joy, when you have no fear. You can work and carry-on and put lots of little happy things in here. I'll go over the colors one more time that we use: Titanium white, Thalo green, Prussian blue, Van Dyke brown, Alizarin crimson, Sap green, Cad yellow, and Permanent red. The light is your friend. Preserve it. We'll take a little bit of Van Dyke Brown. Just let your mind wander and enjoy. This should make you happy. With something so strong, a little bit can go a long way. The more we do this - the more it will do good things to our heart. If what you're doing doesn't make you happy - you're doing the wrong thing. You can create beautiful things - but you have to see them in your mind first. And that's when it becomes fun - you don't have to spend your time thinking about what's happening - you just let it happen. Let your imagination be your guide. I spend a lot of time walking around in the woods and talking to trees, and squirrels, and little rabbits and stuff. No worries. No cares. Just float and wait for the wind to blow you around. I'm gonna start with a little Alizarin crimson and a touch of Prussian blue. I started painting as a hobby when I was little. I didn't know I had any talent. I believe talent is just a pursued interest. Anybody can do what I do. Little trees and bushes grow however makes them happy."
      .split(". ");

    // Remove an item from the list by modifying the firebase
    // reference and letting the change propagate.
    remove(event) {
      var item = event.item
      console.log("removing", item);
      opts.room_ref.child("items").child(item.key).remove();
    }

    // Add an item to the list by modifying the firebase
    // reference and letting the change propagate.
    addItem() {
      var randomBob = bob[Math.floor(Math.random()*bob.length)];
      opts.room_ref.child("items").push(randomBob);
    }
  </script>

  //
  // the css
  //

  <style>
    bob-view a {
      padding-right: 10px;
      font-size: 120%;
    }

    bob-view a:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  </style>

</bob-view>