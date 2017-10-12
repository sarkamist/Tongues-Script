var Tongues = Tongues || (function(){
    'use strict';
    
    //---- INFO ----//
    
    var script = { name: 'Tongues', version: '2.1.0'},
        languages = {},
    
    //---- PRIVATE FUNCTIONS ----//
    
    startup = function(){
        var handouts = findObjs({                              
              _type: 'handout',
        }, {caseInsensitive: true});
        _.each(handouts, function(handout){
            loadHandout(handout, false);
        });
        
        log('> ' + script.name + ' (v' + script.version + '): Found ' + Object.keys(languages).length + ' languages <');
    },
    
    loadHandout = function(handout, reload=true){
        var handoutName = handout.get('name');
        if (handoutName.startsWith('Tongues: ')){
            var languageName = handoutName.replace('Tongues: ', '');
            if (!languages[languageName]){
                languages[languageName] = {};
            }
            languages[languageName].obj = handout;
            if (languages[languageName].obj){
                languages[languageName].obj.get('notes', function(notes){
                    if (notes && notes != 'null'){
                        var matches = notes.match(/(\[.*?\])/igm);
                        languages[languageName].words = [];
                        for (var i = 0; i < matches.length; i++){
                            if(matches[i] == '[]'){
                                languages[languageName].words[i] = null;
                            } else {
                                matches[i] = matches[i].replace('\[', '').replace('\]', '');
                                languages[languageName].words[i] = matches[i].split(', ');
                            }
                        }
                        if (reload){
                            log('> ' + script.name + ' (v' + script.version + '): ' + languageName + ' parsed succesfully! (' + Object.keys(languages).length + ' languages loaded) <');
                        }
                        languages[languageName].obj.get('gmnotes', function(gmnotes){
                            if (gmnotes && gmnotes != 'null'){
                                languages[languageName].speakers = gmnotes.split(', ');
                            } 
                        });
                    }
                });
            } else {
                delete languages[languageName];
                log('> ' + script.name + ' (v' + script.version + '): ' + languageName + ' has a wrong format and cannot be parsed! (' + Object.keys(languages).length + ' languages loaded) <');
            }
        } else {
            _.each(Object.keys(languages), function(key){
                if(languages[key].obj.get('id') === handout.get('id')){
                    delete languages[key];
                    log('> ' + script.name + ' (v' + script.version + '): ' + key + ' removed successfully! (' + Object.keys(languages).length + ' languages loaded) <');
                }
            });
        }
        
        
        return;
    },
    deleteHandout = function(handout){
        var handoutName = handout.get('name');
        if (handoutName.startsWith('Tongues: ')){
            var languageName = handoutName.replace('Tongues: ', '');
            delete languages[languageName];
            log('> ' + script.name + ' (v' + script.version + '): ' + languageName + ' removed successfully! (' + Object.keys(languages).length + ' languages loaded) <');
        }
    },
    
    commandCreate = function(msg, command){
        var newLanguage = createObj('handout', {
            name: 'Tongues: ' + command[3]
        });
        var text = '';
        for(var i = 0; i < 14; i++){
            text += command[3] + ' ' + (i+1) + '-letter words: [] <br>'
        }
        newLanguage.set({
            notes: text
        });
        sendChat('Tongues', '/w ' + msg.who + ' ' + command[3] + ' language template succesfully created!', null, {noarchive:true});
    },
    commandSpeak = function(msg, command){
        if (!msg.selected){
            sendChat('Tongues', '/w ' + msg.who + ' You must select a character token!', null, {noarchive:true});
        } else if (msg.selected.length > 1){
            sendChat('Tongues', '/w ' + msg.who + ' You must select only one character token!', null, {noarchive:true});
        } else {
            var token = getObj('graphic', msg.selected[0]._id);
            var speakerId = token.get('represents');
            var languageName = command[2];
            var text = command[3];
            if (languages[languageName] && languages[languageName].obj){
                if (languages[languageName].speakers){
                    if (isLanguageSpeaker(speakerId, languages[languageName].speakers)){
                        translate(speakerId, languageName, text);
                    } else {
                        sendChat('Tongues', '/w ' + msg.who + ' That character cannot speak ' + languageName + '!', null, {noarchive:true});
                    }
                } else {
                    sendChat('Tongues', '/w ' + msg.who + ' There are no speakers of ' + languageName + '!', null, {noarchive:true});
                }
            } else {
                sendChat('Tongues', '/w ' + msg.who + ' ' + languageName + ' does not exist as a Tongues valid language!', null, {noarchive:true});
            }
        }
    },
    
    translate = function(speakerId, languageName, text){
        var translatedText = text.replace(/([a-z]+)/igm, function(match){
            var n = 1;
            while (!languages[languageName].words[match.length - n] && match.length - n >= 0){
                n++;
            }
            if (match.length - n < 0){
                return match.replace(/[a-z]/ig, '?');
            } else {
                return matchCase(languages[languageName].words[match.length - n][Math.floor(Math.random() * languages[languageName].words[match.length - n].length)], match);
            }
        });
        sendChat('character|' + speakerId, '[' + languageName + '] ' + translatedText);
        sendChat('Tongues', '/w GM [' + languageName + '] ' + text);
        _.each(languages[languageName].speakers, function(speakerName){
            var speaker = findObjs({
                _type: 'character',
                name: speakerName,
            }, {caseInsensitive: true})[0];
            if (speaker && speaker.get('controlledby')){
                sendChat('Tongues', '/w ' + speakerName + ' [' + languageName + '] ' + text);
            }
        });
    },
    
    isLanguageSpeaker = function(speakerId, speakers) {
        var character = getObj('character', speakerId);
        var bool = false;
        if (character){
            var characterName = character.get('name');
            _.find(speakers, function(speakerName) {
                if (characterName == speakerName){
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
    
    //----- INPUT HANDLER -----//
    
    handleInput = function(msg){
        if (msg.type == 'api' && msg.content.startsWith('!tongues ')){
            var regex = /(\![^\ ]+) ([^\ ]+) (.+)/igm;
            var command = regex.exec(msg.content);
            if(command[2].startsWith("--")){
                if(playerIsGM(msg.playerid)){
                    if(command[2] == '--create'){
                        commandCreate(msg, command);
                    } else {
                        sendChat('Tongues', '/w ' + msg.who + ' No valid command!', null, {noarchive:true})
                    }
                } else {
                    sendChat('Tongues', '/w ' + msg.who + ' Only the GM can access Tongues configuration commands!', null, {noarchive:true})
                }
            } else {
                commandSpeak(msg, command);
            }
        }
    },
    
    //---- PUBLIC FUNCTIONS ----//
    
    registerEventHandlers = function(){
		on('chat:message', handleInput);
		on('change:handout', loadHandout);
		on('destroy:handout', deleteHandout);
	},
    
    checkInstall = function(){
        log('> ' + script.name + ' (v' + script.version + ') is installed and running <');
        startup();
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
