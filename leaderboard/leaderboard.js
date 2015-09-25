PlayersList = new Mongo.Collection('players');


//Client-side
if (Meteor.isClient){
	//Subcribe to server
	Meteor.subscribe('thePlayers');
  //Template Helpers
  Template.leaderboard.helpers({
    'player': function(){
    	var currentUserId = Meteor.userId;
		return PlayersList.find({}, {sort: {score: -1}});
	},
	'selectedClass': function(){
		if (Session.get('selectedPlayer') == this._id) {
			return "selected";
		};
	},
	'showSelectedPlayer': function(){
		var selectedPlayer = Session.get('selectedPlayer');
		return PlayersList.findOne(selectedPlayer);
	},
	'playerCount': function(){
		var countPlayer = PlayersList.find().count();
		if (countPlayer == 0) {
			return "No Players added";
		}
	},

  });

  //Template Events
  Template.leaderboard.events({
  	'click .player': function(){
  		Session.set('selectedPlayer', this._id);
  	},
  	'click .increment': function(){
  		var selectedPlayer = Session.get('selectedPlayer');
  		Meteor.call('modifyPlayerScore', selectedPlayer, 5);
  	},
  	'click .decrement': function(){
  		var selectedPlayer = Session.get('selectedPlayer');
  		Meteor.call('modifyPlayerScore', selectedPlayer, -5);
  	},
  	'click .remove': function(){
  		var selectedPlayer = Session.get('selectedPlayer');
  		//Change for method
  		Meteor.call('removePlayerData', selectedPlayer);
  	},

  });

  Template.addPlayerForm.events({
  	'submit form': function(event){
  		event.preventDefault();
  		var playerNameVar = event.target.playerName.value;
  		Meteor.call('insertPlayerData', playerNameVar);
  	}
  });
};

//Server-side
if (Meteor.isServer){
	Meteor.publish('thePlayers',function(){
		var currentUserId = this.userId;
		return PlayersList.find({createdBy: currentUserId})
	});

	// Meteor.methods({
	// 'insertPlayerData': function(playerNameVar){
	// 	var currentUserId = Meteor.userId;
	// 	PlayersList.insert({
	// 		name: playerNameVar,
	// 		score: 0,
	// 		createdBy: currentUserId,
	// 	});
	// },
	// });

	Meteor.methods({
		'insertPlayerData':function(playerNameVar){
			var currentUserId = Meteor.userId();
			PlayersList.insert({
				name: playerNameVar,
				score: 0,
				createdBy: currentUserId
			})
		},
		'removePlayerData': function(selectedPlayer){
      		var currentUserId = Meteor.userId();
      		PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId});
    	},
    	'modifyPlayerScore': function(selectedPlayer, scoreValue){
      		var currentUserId = Meteor.userId();
      		PlayersList.update( {_id: selectedPlayer, createdBy: currentUserId},
                          		{$inc: {score: scoreValue} });
    	}
	});
}