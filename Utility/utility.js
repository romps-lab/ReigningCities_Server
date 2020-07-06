
module.exports = {
 
    isPlayerExist : async function (dbCollection , id){
        let player =  await dbCollection.findOne({'_id' : id}).exec();
        return player;
    },

    registerPlayer : async function(dbCollection , id){
        let newPlayer = new dbCollection({"_id" : id , "entities" : ""});
        await newPlayer.save()
    },

    updatePlayerEntities : async function(dbCollection , id , resources){
        const filter = { "_id" : id };
        const update = { entities: resources };

        // `doc` is the document _after_ `update` was applied because of
        // `new: true`
        let doc = await dbCollection.findOneAndUpdate(filter, update, {
        new: true
        });

        return doc
    }
    
}