
module.exports = {
 
    isPlayerExist : async function (dbCollection , id){
        let player =  await dbCollection.findOne({'_id' : id}).exec();
        return player;
    },

    registerPlayer : async function(dbCollection , id){
        let newPlayer = new dbCollection({"_id" : id , "entities" : []});
        await newPlayer.save()
    }
    
}