# Tongues Script
A simple script to simulate languages on Roll20 and show the translation only to those characters that know the language.

# Installation
- Add a new script on Settings -> API Scripts of the game you want to install the script in
- Copy the contents of tongues.js on this repository to the new script
- Save the script
- Enjoy!

# Usage
Tongues need you to create and define a vocabulary for every language you want to use.

In order to create a new language you may use: `!tongues --create [name]`, this command will create a new handout on your campaign named after the language (prefixed with "Tongues: ") and with its notes section [partially filled](https://i.gyazo.com/850708f4c78922d4172103789aae1b5b.png).

Once the template is created you must fill each row's brackets with some vocabulary, delimited by commas. When speaking a language, the script will take a vocabulary word from the closest length with words available, if you type a 16-length word and there are no 16-length words for that language then the script will take a 15-length one and so on until it finds a length with words available. The create command creates a template with up to 14-length words but you can define greater lengths just by inserting a new row.
A full functional language with new rows created will look close to [this example](https://i.gyazo.com/1d71826d729d78ced5a197b15cbe7d40.png).

Once you have your language defined as you like, you just have to write the full name of its speakers on the GM Notes of the handout, delimited by commas, as shown [here](https://i.gyazo.com/18a69ad25353f671a965875e0adea858.png). The script will look for a character with a name exact to the one written on the GM Notes, you must write the full name of the desired character. If more than one character are named after the same, the script may malfunction.

Once you have you speakers written down on the GM Notes, selecting a token representing those characters and using the command `!tongues [language] [text]`will send to the chat a translated text and whisper all its speakers the original text. **Note:** The GM will always get the original text whispered, which may cause some replicaiton issues since you could be tagged as a character's controller and the script whispers both the GM and the language speaker characters.

To remove a language you simply have to delete its handout as the script does not use data storage and depends on the campaign's handouts.
