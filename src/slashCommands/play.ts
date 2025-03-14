import { SlashCommandBuilder, GuildMember } from "discord.js";
import { SlashCommand } from "../types";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import play from "play-dl";

export const command: SlashCommand = {
    name: 'play',
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Affiche un message")
        .addStringOption((option) => {
            return option
                .setName('url')
                .setDescription('URL de la vidéo Youtube à lire')
                .setRequired(true);
        }),
    async execute(interaction) {
        const url = interaction.options.get("url")?.value as string;
        
        if (!url) {
            await interaction.reply("❌ Vous devez fournir un lien YouTube !");
            return;
        }
        
        const member = interaction.member as GuildMember;   
        const voiceChannel = member?.voice.channel;
        if (!voiceChannel) {
            await interaction.reply("❌ Vous devez être dans un salon vocal !");
            return;
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            const stream = await play.stream(url);
            console.log("Stream : ", stream.stream);
            console.log("Stream type : ", stream.type);
        

            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            console.log("Ressource : ", resource);

            const player = createAudioPlayer();

            console.log(connection.state.status);
            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Playing, () => {
                console.log("▶️ Le bot joue du son !");
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log("⏹️ Le son est terminé !");
                connection.destroy();
            });

            player.on('error', (error) => {
                console.error("❌ Erreur du player :", error);
            });

            await interaction.reply(`🎵 Lecture de la musique : ${url}`);
        } catch (error) {
            console.error(error);
            await interaction.reply("❌ Une erreur est survenue lors de la lecture de la musique.");
        }
    }
}