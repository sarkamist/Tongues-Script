# Tongues Script
A simple script to simulate languages on Roll20 and show the translation only to those characters that know the language.

# Installation
- Add a new script on Settings -> API Scripts of the game you want to install the script in
- Copy the contents of tongues.js on this repository to the new script
- Save the script
- Enjoy!

# Usage
Tongues need you to create and define a vocabulary for every language you want to use.
In order to create a new language you may use: `!tongues --create [name]`, this command will create a new handout on your campaign named after the language and with its notes section partially filled (https://gyazo.com/e57c6e6b7f695a6639a905c2510479a0).
To remove a language you simply have to delete its handout as the script does not use data storage and depends on the campaign's handouts.
