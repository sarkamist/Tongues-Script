var Tongues = Tongues || (function(){
    'use strict';
    
    var script = {
        name: 'Tongues',
        version: '1.1.2'
    },
    
    isLanguageSpeaker = function(speakerId, speakers) {
        var character = getObj('character', speakerId);
        var bool = false;
        if (character){
            var characterName = character.get('name');
            _.find(speakers, function(speakerName) {
                if (characterName.includes(speakerName)){
                    bool = true;
                    return true;
                }
            });
        }
        return bool;
    },
    
    matchCase = function(text, pattern) {
        var result = '';
        for(var i = 0; i < text.length; i++) {
            var c = text.charAt(i);
            var p = pattern.charCodeAt(i);
    
            if(p >= 65 && p < 65 + 26) {
                result += c.toUpperCase();
            } else {
                result += c.toLowerCase();
            }
        }
    
        return result;
    },
    
    translate = function(speakerId, language, text, languageSpeakers){
        language.get('notes', function(notes){
            var matches = notes.match(/(\[.*?\])/igm);
            var words = [];
            for (var i = 0; i < matches.length; i++){
                matches[i] = matches[i].replace('\[', '').replace('\]', '');
                words[i] = matches[i].split(', ');
            }
            var translatedText = text.replace(/([a-z]+)/igm, function (match){
                var n = 1;
                while (!words[match.length - n] && match.length - n >= 0){
                    n++;
                }
                if (match.length - n < 0){
                    return match.replace(/./, '?');
                } else {
                    return matchCase(words[match.length - n][Math.floor(Math.random() * words[match.length - n].length)], match);
                }
            });
            sendChat('character|' + speakerId, '[' + language.get('name') + '] ' + translatedText);
            sendChat('Tongues', '/w GM ' + text);
            if (languageSpeakers && languageSpeakers != 'null'){
                _.each(languageSpeakers, function(speakerName){
                    sendChat('Tongues', '/w ' + speakerName + ' [' + language.get('name') + '] ' + text);
                });
            }
        });
    },
    
    handleInput = function(msg){
        if (msg.type == 'api' && msg.content.startsWith('!tongues ')){
            var regex = /(\![^\ ]+) ([^\ ]+) (.+)/igm;
            var command = regex.exec(msg.content);
            if(command[2] == '--create'){
                var newLanguage = createObj('handout', {
                    name: command[3]
                });
                var text = '';
                for(var i = 0; i < 14; i++){
                    text += command[3] + ' ' + (i+1) + '-letter words: [] <br>'
                }
                newLanguage.set({
                        notes: text
                });
                sendChat('Tongues', '/w ' + msg.who + ' ' + command[3] + ' language template succesfully created!', null, {noarchive:true})
            } else if (command[2].indexOf("--") !== -1) {
                sendChat('Tongues', '/w ' + msg.who + ' No valid command!', null, {noarchive:true})
            } else {
                if (!msg.selected){
                    sendChat('Tongues', '/w ' + msg.who + ' You must select a character token!', null, {noarchive:true})
                } else if (msg.selected.length > 1){
                    sendChat('Tongues', '/w ' + msg.who + ' You must select only one character token!', null, {noarchive:true})
                } else {
                    var token = getObj('graphic', msg.selected[0]._id);
                    var speakerId = token.get('represents');
                    var text = command[3];
                    var language = findObjs({                              
                      _type: 'handout',
                      name: command[2],
                    }, {caseInsensitive: true})[0];
                    if (language){
                        language.get('gmnotes', function(gmnotes){
                            if (gmnotes && gmnotes != 'null'){
                                var speakers = gmnotes.split(', ');
                                if (isLanguageSpeaker(speakerId, speakers)){
                                    translate(speakerId, language, text, speakers);
                                } else {
                                    sendChat('Tongues', '/w ' + msg.who + ' That character cannot speak ' + language.get('name') + '!', null, {noarchive:true});
                                }
                            } else {
                                sendChat('Tongues', '/w ' + msg.who + ' There are no speakers of ' + language.get('name') + '!', null, {noarchive:true});
                            }
                        });
                    } else {
                        sendChat('Tongues', '/w ' + msg.who + ' ' + command[2] + ' does not exist as a Tongues valid language!', null, {noarchive:true});
                    }
                }
            }
        }
    },
    
    registerEventHandlers = function() {
		on('chat:message', handleInput);
	},
    
    checkInstall = function(){
        log('-=> ' + script.name + ' (v' + script.version + ') <=-');
    };
    
    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function() {
    Tongues.checkInstall();
    Tongues.registerEventHandlers();
});
