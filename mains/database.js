const { Client, MessageEmbed } = require("discord.js") // 40 STAR GELDIGINDE DAHA GELISMISINI PAYLASACAGIM SIMDILIK SIZI IDARE EDER BIR BOT PAYLASTIM SONRA NEDEN DEDIGIN HIZDA DEGIL DIYE SORMAYIN ;D
const moment = require("moment")//bot v12 40 starda v13 halini paylaşacağım ama bu sizi idare eder derecede bir bot
const mongoose = require("mongoose")
const { DATABASE, PREFIX, READY, DEV, MONGOOSE, GUILD } = require("../settings.json") 
const client = new Client()
const { MessageButton } = require("discord-buttons")
require("discord-buttons")(client)
client.login(DATABASE).catch(() => console.log("Database giriş yapamadı!"))
mongoose.connect(MONGOOSE).catch(() => console.log("Mongoose bağlantısı bulunmuyor!"))

//supportive
const supp = new Client()//40 starda sağlayıcılarla paylaşacağım
const rData = require("../db/rol")
const cData = require("../db/kanal")
let csetupReason = "Mavera Backup"
let rsetupReason = "Mavera Backup"

client.on("ready", () => {
  client.user.setPresence({ activity:{name:READY},status:"dnd" })
  console.log(client.user.tag)
})

client.on("message", async msg => {
  if(msg.author.bot || !msg.guild || !msg.content.toLocaleLowerCase().startsWith(PREFIX)) return
  if(msg.author.id !== DEV) return
  let args = msg.content.split(" ").slice(1)
  let cmds = msg.content.split(" ")[0].slice(PREFIX.length)

  if(cmds === "eval") {
      if(!args[0]) return msg.reply("mavera - code?")
      let code = args.join(" ")
      function clean(text) {
          if(typeof text != "string") text = require("util").inspect(text, { depth: 0           })
          text = text.replace(/`/g, '`' + String.fromCharCode(8203).replace(/@/g, '@' + String.fromCharCode(8203)))
          return text
      } try {
          var evaled = clean(await eval(code))
          if(evaled.match(new RegExp(`${client.token}`, "g"))) evaled.replace(client.token, "mavera aptal botçuların böyle bir komut koyacağını bildiği için yasakladı")
          msg.channel.send(`${evaled.replace(client.token, "mavera aptal botçuların böyle bir komut koyacağını bildiği için yasakladı")}`, { code: "js", split: true })
      } catch(maverr) {
          msg.channel.send(maverr, { code: "js", split: true })
      }
    }
    if(cmds == "r") {
    if(!args[0] || isNaN(args[0])) return msg.channel.send("mavera - arguman?")
    rData.findOne({
        guildID: GUILD,
        roleID: args[0]
    }, async(err, roleData) => {
        if(!roleData) return msg.reply("mavera - rol idsini dbde bulamadım.")
        msg.channel.send(`${roleData.name} (\`${args[0]}\`) rolü oluşturuluyor!`)
        client.users.cache.get(DEV).send(`${roleData.name} (\`${args[0]}\`) rolü oluşturuluyor! (\`${msg.author.tag}\`)`)
        msg.guild.owner.send(`${roleData.name} (\`${args[0]}\`) rolü oluşturuluyor! (\`${msg.author.tag}\`)`)
        client.channels.cache.find(x => x.name == "database_log").send(`${msg.author} (\`${msg.author.tag}\`) **${roleData.name}** (\`${args[0]}\`) rolünü oluşturdu!`)
        let yeniRol = await msg.guild.roles.create({
            data: {
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                permissions: roleData.permissions,
                position: roleData.position,
                mentionable: roleData.mentionable
            }, reason: rsetupReason
        })

            let kanalPermVeri = roleData.channelOverwrites
            if(kanalPermVeri) kanalPermVeri.forEach((perm, index) => {
                let kanal = msg.guild.channels.cache.get(perm.id)
                if(!kanal) return;
                let newVeri = {}
                perm.allow.forEach(p => {
                    newVeri[p] = true
                })
                perm.deny.forEach(p => {
                    newVeri[p] = false
                })
                kanal.createOverwrite(yeniRol, newVeri).catch(console.error)
                    let new2 = {}
                    perm.allow.forEach(p => {
                        new2[p] = true
                    })
                    perm.deny.forEach(p => {
                        new2[p] = false
                    })
                    kanal.createOverwrite(yeniRol, new2).catch(console.error)
            })

        let roleMembers = roleData.members
        roleMembers.forEach((member, index) => {
            let uye = msg.guild.members.cache.get(member)
            if(!uye || uye.roles.cache.has(yeniRol.id)) return
            uye.roles.add(yeniRol.id).catch()
        })
    })
  }
  if(cmds == "c") {
    if(!args[0] || isNaN(args[0])) return msg.reply("mavera kanal id?")

        cData.findOne({
            guildID: GUILD,
            channelID: args[0]
        }, async(err, channelData) => {
            if(!channelData) return msg.reply("mavera?")
            msg.channel.send(`${channelData.name} (\`${args[0]}\`) kanalı oluşturuluyor!`)
        client.users.cache.get(DEV).send(`${channelData.name} (\`${args[0]}\`) kanalı oluşturuluyor! (\`${msg.author.tag}\`)`)
        msg.guild.owner.send(`${channelData.name} (\`${args[0]}\`) kanalı oluşturuluyor! (\`${msg.author.tag}\`)`)
        client.channels.cache.find(x => x.name == "database_log").send(`${msg.author} (\`${msg.author.tag}\`) **${channelData.name}** (\`${args[0]}\`) kanalını oluşturdu!`)

            msg.guild.channels.create(channelData.name, {
                type: channelData.type
            }).then(channel => {
                if(channel.type === "voice") {
                    channel.setBitrate(channelData.bitrate)
                    channel.setUserLimit(channelData.userLimit)
                    channel.setParent(channelData.parentID)
                    channel.setPosition(channelData.position)
                    
                    if(Object.keys(channelData.permissionOverwrites[0]).length > 0) {
                        for (let i = 0; i < Object.keys(channelData.permissionOverwrites[0]).length; i++) {
                            channel.createOverwrite(channelData.permissionOverwrites[0][i].permission, channelData.permissionOverwrites[0][i].thisperm)
                        }
                    }
                } else {
                    if(channel.type === "category") {
                        if(Object.keys(channelData.permissionOverwrites[0]).length > 0) {
                            for (let i = 0; i < Object.keys(channelData.permissionOverwrites[0]).length; i++) {
                                channel.createOverwrite(channelData.permissionOverwrites[0][i].permission, channelData.permissionOverwrites[0][i].thisperm)
                            }
                        }
                    } else {
                        channel.setRateLimitPerUser(channelData.setRateLimitPerUser)
                        channel.setTopic(channelData.topic)
                        channel.setParent(channelData.parentID)
                        channel.setPosition(channelData.position)

                        if(Object.keys(channelData.permissionOverwrites[0]).length > 0) {
                            for (let i = 0; i < Object.keys(channelData.permissionOverwrites[0]).length; i++) {
                                channel.createOverwrite(channelData.permissionOverwrites[0][i].permission, channelData.permissionOverwrites[0][i].thisperm)
                            }
                        }
                    }
                }
            })
        })
    }
  if(cmds == "base") {
    const toparla = new MessageButton().setLabel("Toparla").setStyle("green").setID("toparla")
    const backup = new MessageButton().setLabel("Veri Kayıt").setStyle("gray").setID("backup")
    const sil = new MessageButton().setLabel("Veri Sil").setStyle("red").setID("sil")
    msg.channel.send(new MessageEmbed().setDescription(`${msg.guild.emojis.cache.find(x => x.name == "mavera_star")} Sunucu ile ilgili yapmak istediğiniz işlem(leri) aşağıdaki panel ile seçiniz. Unutmayınız ki yapılan işlemler geri alınamaz.

${msg.guild.emojis.cache.find(x => x.name == "mavera_nokta2")} \`Toparla (yakında):\` Sunucudaki rol ve kanalları silip veritabanındakileri kurarsınız.
${msg.guild.emojis.cache.find(x => x.name == "mavera_nokta2")} \`Veri Kayıt:\` Sunucunun rol ve kanal verilerini yedekler. Veri varsa silinir, yeni veriler yedeklenir.
${msg.guild.emojis.cache.find(x => x.name == "mavera_nokta2")} \`Veri Sil:\` Sunucunun rol ve kanal verilerini siler.
`).setFooter(READY).setTimestamp().setColor("GOLD"), 
    { buttons: [toparla, backup, sil] })
}
})

client.on("clickButton", async (button) => {
  if(button.clicker.member.id !== DEV) return
  if(button.id == "backup") {
    rkayıt()
    ckayıt()
    await button.reply.think(false)
    await button.reply.edit(`${button.guild.emojis.cache.find(x => x.name == "mavera_tik")} Sunucudaki rol ve kanal verileri yedeklendi!`, { ephemeral:false })
  }
  if(button.id == "sil") {
      cData.deleteMany({})
      rData.deleteMany({})
      await button.reply.think(false)
      await button.reply.edit(`${button.guild.emojis.cache.find(x => x.name == "mavera_tik")} Sunucudaki rol ve kanal verileri silindi!`, { ephemeral:false })
  }
})

function rkayıt(serverID) {
  let guild = client.guilds.cache.get(GUILD)
  if(!guild) return

  guild.roles.cache.filter(r => r.name !== "@everyone" && !r.managed).forEach(role => {
      let roleChannelOverwrites = []
      guild.channels.cache.filter(c => c.permissionOverwrites.has(role.id)).forEach(c => {
          let cperm = c.permissionOverwrites.get(role.id)
          let pushing = {
              id: c.id,
              allow: cperm.allow.toArray(),
              deny: cperm.deny.toArray()
          }
          roleChannelOverwrites.push(pushing)
      })

      rData.findOne({
          guildID: GUILD,
          roleID: role.id
      }, async(err, savedRole) => {
          if(!savedRole) {
              let newRoleSchema = new rData({
                  _id: new mongoose.Types.ObjectId(),
                  guildID: GUILD,
                  roleID: role.id,
                  name: role.name,
                  color: role.hexColor,
                  hoist: role.hoist,
                  position: role.position,
                  permissions: role.permissions,
                  mentionable: role.mentionable,
                  time: Date.now(),
                  members: role.members.map(m => m.id),
                  channelOverwrites: roleChannelOverwrites
              })
              newRoleSchema.save()
          } else {
              savedRole.name = role.name
              savedRole.color = role.hexColor
              savedRole.hoist = role.hoist
              savedRole.position = role.position
              savedRole.permissions = role.permissions
              savedRole.mentionable = role.mentionable
              savedRole.time = Date.now()
              savedRole.members = role.members.map(x => x.id)
              savedRole.channelOverwrites = roleChannelOverwrites
              savedRole.save()
          }
      })
  })
  
}

function ckayıt() {
  let guild = client.guilds.cache.get(GUILD)
  if(!guild) return
  if(guild) {
      guild.channels.cache.filter(x => x.deleted !== true).forEach(channel => {
          let permx = {}
          let sayi = Number(0)
          channel.permissionOverwrites.forEach((perm) => {
              let thisperm = {}
              perm.allow.toArray().forEach(p => {
                  thisperm[p] = true
              })
              perm.deny.toArray().forEach(p => {
                  thisperm[p] = false
              })
              permx[sayi] = {
                  permission: perm.id == null ? guild.id : perm.id, thisperm
              }
              sayi++
          })

          cData.findOne({
              guildID: GUILD,
              channelID: channel.id
          }, async(err, savedChannel) => {
              if(!savedChannel) {
                  if(channel.type === "voice") {
                      let schema = new cData({
                          _id: new mongoose.Types.ObjectId(),
                          guildID: GUILD,
                          channelID: channel.id,
                          name: channel.name,
                          parentID: channel.parentID,
                          position: channel.position,
                          time: Date.now(),
                          type: channel.type,
                          permissionOverwrites: permx,
                          userLimit: channel.userLimit,
                          bitrate: channel.bitrate
                      })
                      schema.save()
                  } else if(channel.type === "category") {
                      let newChannelSchema = new cData({
                          _id: new mongoose.Types.ObjectId(),
                          guildID: GUILD,
                          channelID: channel.id,
                          name: channel.name,
                          position: channel.position,
                          time: Date.now(),
                          type: channel.type,
                          permissionOverwrites: permx,
                        });
                        newChannelSchema.save()
                  } else {
                      let newsch = new cData({
                          _id: new mongoose.Types.ObjectId(),
                          guildID: GUILD,
                          channelID: channel.id,
                          name: channel.name,
                          parentID: channel.parentID,
                          position: channel.position,
                          time: Date.now(),
                          nsfw: channel.nsfw,
                          rateLimitPerUser: channel.rateLimitPerUser,
                          type: channel.type,
                          topic: channel.topic ? channel.topic : csetupReason,
                          permissionOverwrites: permx
                      })
                      newsch.save()
                  }
              } else {
                  if(channel.type === "voice") {
                      savedChannel.name = channel.name
                      savedChannel.parentID = channel.parentID
                      savedChannel.position = channel.position
                      savedChannel.type = channel.type;
                      savedChannel.time = Date.now();
                      savedChannel.permissionOverwrites = permx
                      savedChannel.userLimit = channel.userLimit
                      savedChannel.bitrate = channel.bitrate
                      savedChannel.save()
                  } else if(channel.type === "category") {
                      savedChannel.name = channel.name
                      savedChannel.position = channel.position
                      savedChannel.type = channel.type
                      savedChannel.time = Date.now()
                      savedChannel.permissionOverwrites = permx
                      savedChannel.save()
                  } else {
                      savedChannel.name = channel.name
                      savedChannel.parentID = channel.parentID
                      savedChannel.position = channel.position
                      savedChannel.nsfw = channel.nsfw
                      savedChannel.rateLimitPerUser = channel.rateLimitPerUser
                      savedChannel.type = channel.type
                      savedChannel.time = Date.now()
                      savedChannel.topic = channel.topic ? channel.topic : csetupReason
                      savedChannel.permissionOverwrites = permx
                      savedChannel.save()
                  }
              }
          })
      })
  }
}
