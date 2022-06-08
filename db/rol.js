const { Schema, model } = require("mongoose")

const mavera = Schema({
    _id: Schema.Types.ObjectId,
    guildID: String,
    roleID: String,
    name: String,
    color: String,
    hoist: Boolean,
    position: Number,
    permissions: Number,
    mentionable: Boolean,
    time: Number,
    members: Array,
    channelOverwrites: Array
})

module.exports = model("roleDB", mavera)
