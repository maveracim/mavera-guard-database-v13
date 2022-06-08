const { Schema, model } = require("mongoose")

const mavera = Schema({
    _id: Schema.Types.ObjectId,
    guildID: String,
    channelID: String,
    name: String,
    parentID: String,
    position: Number,
    permissionOverwrites: Array,
    nsfw: Boolean,
    rateLimitPerUser: Number,
    type: String,
    topic: String,
    time: Number,
    userLimit: Number,
    bitrate: Number
})

module.exports = model("channelDB", mavera)
