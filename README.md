# Tongues Script
A simple script to simulate languages on Roll20 and show the translation only to those characters that know the language.

# Installation
- Add a new script on Settings -> API Scripts of the game you want to install the script in
- Copy the contents of tongues.js on this repository to the new script
- Save the script
- Enjoy!

# Usage
Tongues need you to create and define a vocabulary for every language you want to use.
In order to create a new language you may use: `!tongues --create [name]`, this command will create a new handout on your campaign named after the language and with its notes section [partially filled](https://gyazo.com/e57c6e6b7f695a6639a905c2510479a0).
Once the template is created you must fill each row's brackets with some vocabulary, delimited by commas. When speaking a language, the script will take a random vocabulary word from the closest length with words available, if you type a 16-length word and there are no 16-length words for that language then the scipt will take a 15-length one and so on until it finds a length with words available. The create command creates a template with up to 14-length words but you can define greater lengths just by inserting a new row. Keep in mind that currently leaving a row with its brackets empty can cause some bugs, so its better to remove an unused row than leaving it empty.
A full functional language with new rows created will look close to [this example](https://gyazo.com/df00a4cd3d258c68b5e53507f912065e).
Once you have your language defined as you like, you just have to write the name of its speakers on the GM Notes of the handout, delimited by commas, as shown [here](https://gyazo.com/7100ba573e40b1f7d9878869a68fed46). The script will look for a character with a name similar to the one written on the GM Notes, for exmaple: if you have a character named John Smith and you just write only John on the GM Notes, it will work as no other characters named John exist, but if there is another John, the script may malfunction. To prevent this try to write the full name of the character or make sure that no other character has a similar name since things like two characters named after keyword Dragon: "**Dragons**layer" and "Green **Dragon**", could make the script malfunction.
Once you have you speakers written down on the GM Notes, selecting a token representing those characters and using the command `!tongues [language] [text]`will send to the chat a translated text and whisper all its speakers the original text.
To remove a language you simply have to delete its handout as the script does not use data storage and depends on the campaign's handouts.
