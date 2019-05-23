// Fix for HTML and inline rolls by The Aaron
var Tongues = Tongues || (function(){
    'use strict';
    
    //---- INFO ----//
    
    var script = { name: 'Tongues', version: '4.5.3'},
        devMode = false,
        languages = {},
    
    //---- PRIVATE FUNCTIONS ----//
    
    startup = function(){
        if (!state.Tongues || devMode){
            resetState();
        }

        var handouts = findObjs({                              
            _type: 'handout'
        }, {caseInsensitive: true});
            _.each(handouts, function(handout){
                loadHandout(handout, false);
            });

            log('> ' + script.name + ' (v' + script.version + '): Found ' + Object.keys(languages).length + ' languages <');
    },
    resetState = function(){
        state.Tongues = {
            savedSpeaker: 'John Smith',
            showTokenName: false,
            displayLanguageName: true,
            version: script.version
        };
        log('> ' + script.name + ' (v' + script.version + ') created new state storage <');
    },

    loadHandout = function(handout, reload=true){

		const stripHTML = (t) => t.replace(/<br\/?>/gi,'\n').replace(/<\/div>/gi,'\n').replace(/<[^>]*?>/g,'');

        var handoutName = handout.get('name');
        if (handoutName.startsWith('Tongues: ')){
            var languageName = handoutName.replace('Tongues: ', '');
            if (!languages[languageName]){
                languages[languageName] = {};
            }
            languages[languageName].obj = handout;
            if (languages[languageName].obj){
                languages[languageName].obj.get('notes', function(notes){
					notes = stripHTML(notes);
                    if (textIsValid(notes)){
                        dLog(languageName + ' is valid!');
                        var matches = notes.match(/(\[.*?\])/igm);
                        languages[languageName].dictionary = {};
                        languages[languageName].vocabulary = [];
                        for (var i = 0; i < matches.length; i++){
                            if(matches[i].match(/(\[.+:.+\])/igm)){
                                matches[i] = matches[i].replace(/\[([^[\]]+)\]/ig, '$1');
                                var words = matches[i].toLowerCase().split(/\s*:\s*/);
                                var originals = words[0].split(/\s*,\s*/);
                                var translation = words[1];
                                _.each(originals, function(original){
                                    languages[languageName].dictionary[original.trim()] = translation.trim();
                                });
                            } else if(matches[i] == '[]'){
                                languages[languageName].vocabulary[i] = null;
                            } else {
                                matches[i] = matches[i].replace(/\[([^[\]]+)\]/ig, '$1');
                                languages[languageName].vocabulary[i] = matches[i].split(/\s*,\s*/);
                            }
                        }
                        if (reload){
                            log('> ' + script.name + ' (v' + script.version + '): ' + languageName + ' parsed succesfully! (' + Object.keys(languages).length + ' languages loaded) <');
                        }
                        languages[languageName].obj.get('gmnotes', function(gmnotes){
							gmnotes = stripHTML(gmnotes);
                            if (textIsValid(gmnotes)){
                                dLog(languageName + ' speakers are valid!');
                                languages[languageName].speakers = [];
                                var languageSpeakers = gmnotes.replace(/<.*?>/g,'').split(/\s*,\s*/);
                                dLog(languageName + ' speakers: ' + languageSpeakers);
                                _.each(languageSpeakers, function(languageSpeaker){
                                    languageSpeaker = languageSpeaker.split(/\s*:\s*/);
                                    if (languageSpeaker[1]){
                                        languages[languageName].speakers.push({
                                            name: languageSpeaker[0].trim(),
                                            learning: parseInt(languageSpeaker[1].trim())
                                        });
                                    } else {
                                        languages[languageName].speakers.push({
                                            name: languageSpeaker[0].trim(),
                                            learning: 100
                                        });
                                    }
                                });
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

    commandConfig = function(msg, command){
        var param = command[3].split(/\s*:\s*/);
        var bool = (param[1] === 'true');
        switch (param[0]){
            case 'show':
                var text = '<br>';
                text += '[savedSpeaker] ' + state.Tongues.savedSpeaker + '<br>';
                text += '[showTokenName] ' + state.Tongues.showTokenName + '<br>';
                text += '[displayLanguageName] ' + state.Tongues.displayLanguageName + '<br>';
                sendChat('Tongues', '/w ' + msg.who + text, null, {noarchive:true});
                break;
            case 'reset':
                resetState();
                sendChat('Tongues', '/w ' + msg.who + 'Configuration successfully restored to default!', null, {noarchive:true});
                break;
            case 'displayLanguageName':
                state.Tongues.displayLanguageName = bool;
                sendChat('Tongues', '/w ' + msg.who + '<br>[displayLanguageName]<br> Successfully changed to ' + bool + '!', null, {noarchive:true});
                break;
            case 'showTokenName':
                state.Tongues.showTokenName = bool;
                sendChat('Tongues', '/w ' + msg.who + '<br>[showTokenName]<br> Successfully changed to ' + bool + '!', null, {noarchive:true});
                break;
            default:
                sendChat('Tongues', '/w ' + msg.who + ' That configuration parameter does not exist!', null, {noarchive:true});
                break;
        }
    },
    commandAbility = function(msg, command, info=true){
        if (!msg.selected){
            sendChat('Tongues', '/w ' + msg.who + ' You must select a character token!', null, {noarchive:true});
        } else if (msg.selected.length > 1){
            sendChat('Tongues', '/w ' + msg.who + ' You must select only one character token!', null, {noarchive:true});
        } else {
            var token = getObj('graphic', msg.selected[0]._id);
            var speakerId = token.get('represents');
            var macro = '!tongues ?{Select a language';
                _.each(Object.keys(languages), function(key){
                    if(isLanguageSpeaker(speakerId, languages[key].speakers)){
                        macro += '|' + key;
                    }
                });
                macro += '} ?{Message}';
                var abilities = findObjs({
                    name: 'Tongues',
                    characterid: speakerId
                });
                var message = '';
                if (abilities && abilities.length > 0){
                    abilities[0].set({
                        action: macro
                    });
                    message = ' Ability successfully updated!';
                } else {
                    createObj("ability", {
                        name: 'Tongues',
                        characterid: speakerId,
                        action: macro,
                        istokenaction: true
                    });
                    message = ' Ability successfully created!';
                }
                if (info) {
                    sendChat('Tongues', '/w ' + msg.who + message, null, {noarchive:true});
                }
        }
    },
    commandSet = function(msg, command, unset=false){
        if (!msg.selected){
            sendChat('Tongues', '/w ' + msg.who + ' You must select a character token!', null, {noarchive:true});
        } else if (msg.selected.length > 1){
            sendChat('Tongues', '/w ' + msg.who + ' You must select only one character token!', null, {noarchive:true});
        } else {
            var token = getObj('graphic', msg.selected[0]._id);
            var character = getObj('character', token.get('represents'));
            var params = command[3].split(/\s*:\s*/);
            var languageName = params[0].trim();
            var languageLearning = undefined;
            if (params[1]) {
                languageLearning = parseInt(params[1].trim());
            }
            if (languages[languageName]){
                languages[languageName].obj.get('gmnotes', function(gmnotes){
                    if (textIsValid(gmnotes)){
                        var speakers = gmnotes.split(/\s*,\s*/);
                        /* let speaker = */ _.find(speakers, function(speaker){
                            speaker = speaker.trim().split(/\s*:\s*/);
                            if(speaker[0] == character.get('name')){
                                var pattern = new RegExp('[, ]*' + speaker[0], 'igm');
                                if (speaker[1]){
                                    pattern = new RegExp('[, ]*' + speaker[0] + ':' + speaker[1], 'igm');
                                }
                                gmnotes = gmnotes.replace(pattern, '');
                            }
                        });
                    } else {
                        gmnotes = '';
                    }
                    
                    var text = ((gmnotes)? gmnotes + ', ':'') + character.get('name');
                    if(languageLearning){
                        text += ':' + languageLearning + '%';
                    }
                    
                    if(!unset){
                        languages[languageName].obj.set({
                            gmnotes: text 
                        });
                        sendChat('Tongues', '/w ' + msg.who + ' Language knowledge succesfully added!', null, {noarchive:true});
                    } else {
                        languages[languageName].obj.set({
                            gmnotes: gmnotes
                        });
                        sendChat('Tongues', '/w ' + msg.who + ' Language knowledge succesfully removed!', null, {noarchive:true});
                    }
                    var abilities = findObjs({
                        name: 'Tongues',
                        characterid: character.get('_id')
                    });
                    if (abilities && abilities.length > 0){
                        msg.content = '!tongues --ability';
                        commandAbility(msg, ['!tongues', '--ability', null], false);
                    }
                });
            } else {
               sendChat('Tongues', '/w ' + msg.who + ' ' + languageName + ' does not exist as a Tongues valid language!', null, {noarchive:true}); 
            }
        }
    },
    commandCreate = function(msg, command){
        var newLanguage = createObj('handout', {
            name: 'Tongues: ' + command[3]
        });
        var text = 'Vocabulary: <br>';
        for(var i = 0; i < 14; i++){
            text += command[3] + ' ' + (i+1) + '-letter words: [] <br>';
        }
        text += '<hr>Dictionary: <br>[Language, Speech, Cant, Dialect: Tongue]<br>[Hello: Goodbye]<br>[Goodbye: Hello]';
        newLanguage.set({
            notes: text
        });
        sendChat('Tongues', '/w ' + msg.who + ' ' + command[3] + ' language template succesfully created!', null, {noarchive:true});
    },
    commandSpeaker = function(msg, command){
        state.Tongues.savedSpeaker = command[3];
        sendChat('Tongues', '/w ' + msg.who + 'Default speaker name successfully changed!', null, {noarchive:true});
    },
    commandSpeak = function(msg, command){
        if (!msg.selected && !playerIsGM(msg.playerid)){
            sendChat('Tongues', '/w ' + msg.who + ' You must select a character token!', null, {noarchive:true});
        } else if (msg.selected && msg.selected.length > 1){
            sendChat('Tongues', '/w ' + msg.who + ' You must select only one character token!', null, {noarchive:true});
        } else {
            var token = (msg.selected)?getObj('graphic', msg.selected[0]._id):null;
            var speakerId = (token)?token.get('represents'):'#' + state.Tongues.savedSpeaker;
            if (!speakerId || speakerId == ''){
                speakerId = '#' + getTokenName(token);
            }
            var languageName = command[2];
            var text = command[3];
            if (languages[languageName] && languages[languageName].obj){
                if (languages[languageName].speakers){
                    var learning = isLanguageSpeaker(speakerId, languages[languageName].speakers);
                    if (learning){
                        translate(token, speakerId, languageName, text, learning);
                    } else if (!learning && playerIsGM(msg.playerid)) {
                        translate(token, speakerId, languageName, text, 100);
                    } else {
                        sendChat('Tongues', '/w ' + msg.who + ' That character cannot speak ' + languageName + '!', null, {noarchive:true});
                    }
                } else if (playerIsGM(msg.playerid)) {
                    translate(token, speakerId, languageName, text, 100, false);
                } else {
                    sendChat('Tongues', '/w ' + msg.who + ' There are no speakers of ' + languageName + '!', null, {noarchive:true});
                }
            } else {
                sendChat('Tongues', '/w ' + msg.who + ' ' + languageName + ' does not exist as a Tongues valid language!', null, {noarchive:true});
            }
        }
    },
    translate = function(token, speakerId, languageName, text, learning, translate = true){
        _.each(Object.keys(languages[languageName].dictionary), function(key){
            var pattern = new RegExp(key, 'ig');
            text = text.replace(pattern, function(word){
                return matchCase(key.replace(/\s/ig, '_'), word);
            });
        });
        var translatedText = text.replace(/\$[^$]+\$|([\u00BF-\u1FFF\u2C00-\uD7FF\w_]+)/igm, function(word){
            word = word.replace(/_/ig, ' ');
            
            //NOT TRANSLATED
            if(word.match(/\$[^$]+\$/ig)){
                return word.replace(/\$/ig, '');
            }
            
            //NOT ENOUGH LEARNING TO TRANSLATE
            var difficulty = (wordHash(word) % 100) + 1;
            if (learning < difficulty){
                return word;
            }
            
            //TRANLSATED WITH DICTIONARY
            if(languages[languageName].dictionary[word.toLowerCase()]){
                return matchCase(languages[languageName].dictionary[word.toLowerCase()], word);
            }
            
            //TRANSLATED WITH VOCABULARY
            var n = 1;
            while (!languages[languageName].vocabulary[word.length - n] && word.length - n >= 0){
                n++;
            }
            if (word.length - n < 0){
                return word.replace(/[\u00BF-\u1FFF\u2C00-\uD7FF\w]/ig, '?');
            } else {
                var hash = wordHash(word) % languages[languageName].vocabulary[word.length - n].length;
                return matchCase(languages[languageName].vocabulary[word.length - n][hash], word);
            }
        });
        var originalText = text.replace(/\$[^$]+\$|([\u00BF-\u1FFF\u2C00-\uD7FF\w_]+)/igm, function(word){
            word = word.replace(/_/ig, ' ');
            
            //NOT TRANSLATED
            if(word.match(/\$[^$]+\$/ig)){
                return word.replace(/\$([^$]+)\$/ig, '<span style="color: RoyalBlue;">$1</span>');
            }
            
            //NOT ENOUGH LEARNING TO TRANSLATE
            var difficulty = (wordHash(word) % 100) + 1;
            if (learning < difficulty){
                return '<span style="color: RoyalBlue;">' + word + '</span>';
            }
            
            //TRANSLATED
            return word;
        });
        var speaker;
        if (state.Tongues.showTokenName){
            speaker = getTokenName(token);
        } else if (speakerId.startsWith('#')){
            speaker = speakerId.replace('#', '');
        } else {
            speaker = 'character|' + speakerId;
        }
        
        if (state.Tongues.displayLanguageName){
            sendChat(speaker, '[' + languageName + '] ' + translatedText);
        } else {
            sendChat(speaker, translatedText);
        }

        sendChat('Tongues - GM', '/w GM' + ' [' + languageName + '] ' + originalText);
        
        if (translate){
            _.each(languages[languageName].speakers, function(speaker){
                var speakerObj = findObjs({
                    _type: 'character',
                    name: speaker.name
                }, {caseInsensitive: true})[0];
                if (speakerObj && speakerObj.get('controlledby')){
                    if (speaker.learning >= 100){
                        sendChat('Tongues [' + speakerObj.get('name') + ']', '/w ' + speakerObj.get('name') + ' [' + languageName + '] ' + originalText);
                    } else {
                        var understoodText = text.replace(/\$[^$]+\$|([\u00BF-\u1FFF\u2C00-\uD7FF\w_]+)/igm, function(word){
                            word = word.replace(/_/ig, ' ');
                            
                            //NOT TRANSLATED
                            if(word.match(/\$[^$]+\$/ig)){
                                return word.replace(/\$([^$]+)\$/ig, '<span style="color: RoyalBlue;">$1</span>');
                            }
                            
                            //NOT ENOUGH LEARNING TO UNDERSTAND
                            var difficulty = (wordHash(word) % 100) + 1;
                            if (learning < difficulty){
                                return '<span style="color: RoyalBlue;">' + word + '</span>';
                            }
                            
                            //NOT ENOUGH LEARNING TO UNDERSTAND
                            if (speaker.learning < difficulty){
                                    //TRANLSATED WITH DICTIONARY
                                    if(languages[languageName].dictionary[word.toLowerCase()]){
                                        return '<span style="color: FireBrick;">' + matchCase(languages[languageName].dictionary[word.toLowerCase()], word) + '</span>';
                                    }
                                    
                                    //TRANSLATED WITH VOCABULARY
                                    var n = 1;
                                    while (!languages[languageName].vocabulary[word.length - n] && word.length - n >= 0){
                                        n++;
                                    }
                                    if (word.length - n < 0){
                                        return word.replace(/[\u00BF-\u1FFF\u2C00-\uD7FF\w]/ig, '?');
                                    } else {
                                        var hash = wordHash(word) % languages[languageName].vocabulary[word.length - n].length;
                                        return '<span style="color: FireBrick;">' + matchCase(languages[languageName].vocabulary[word.length - n][hash], word) + '</span>';
                                    }
                            }
                            
                            //TRANSLATED
                            return word;
                        });
                        sendChat('Tongues', '/w ' + speakerObj.get('name') + ' [' + languageName + '] ' + understoodText);
                    }
                }
            });
        }
    },
    isLanguageSpeaker = function(speakerId, speakers) {
        if(speakerId.startsWith('#')){
            return false;
        }
        var character = getObj('character', speakerId);
        var learning = null;
        if (character){
            var characterName = character.get('name');
            _.find(speakers, function(speaker) {
                if (characterName == speaker.name){
                    learning = speaker.learning;
                    return true;
                }
            });
        }
        return learning;
    },
    wordHash = function(str){
        var hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr   = str.charAt(i).toLowerCase().charCodeAt(0);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
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
    getTokenName = function(token) {
        var name = token.get('name');
        if (!name || name == ''){
            name = state.Tongues.savedSpeaker;
        }
        
        return name;
    },
    textIsValid = function(string) {
        return (
            string &&
            string != '' &&
            string != 'null' &&
            !string.match(/^<.*?>/g)
        );
    },
    
    //----- INPUT HANDLER -----//


    
    handleInput = function(msg){

        const processInlinerolls = (msg) => {
            if(_.has(msg,'inlinerolls')){
                return _.chain(msg.inlinerolls)
                    .reduce(function(m,v,k){
                        let ti=_.reduce(v.results.rolls,function(m2,v2){
                            if(_.has(v2,'table')){
                                m2.push(_.reduce(v2.results,function(m3,v3){
                                    m3.push(v3.tableItem.name);
                                    return m3;
                                },[]).join(', '));
                            }
                            return m2;
                        },[]).join(', ');
                        m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
                        return m;
                    },{})
                    .reduce(function(m,v,k){
                        return m.replace(k,v);
                    },msg.content)
                    .value();
            } else {
                return msg.content;
            }
        };

        if (msg.type == 'api' && msg.content.startsWith('!tongues ')){
            var regex = /(![^ ]+) ([^ ]+)(.+)*/igm;
            var command = regex.exec(processInlinerolls(msg));
            if (command[3]){
                command[3] = command[3].trim();
            }
            if (command && command[2]){
                if(command[2].startsWith("--")){
                    if(playerIsGM(msg.playerid)){
                        if(command[2] == '--create' && command[3]){
                            commandCreate(msg, command);
                        } else if (command[2] == '--config' && command[3]) {
                            commandConfig(msg, command);
                        } else if (command[2] == '--ability') {
                            commandAbility(msg, command);
                        } else if (command[2] == '--set' && command[3]) {
                            commandSet(msg, command);
                        } else if (command[2] == '--unset' && command[3]) {
                            commandSet(msg, command, true);
                        } else if (command[2] == '--speaker' && command[3]) {
                            commandSpeaker(msg, command);
                        } else {
                            sendChat('Tongues', '/w ' + msg.who + ' Invalid command!', null, {noarchive:true});
                        }
                    } else {
                        sendChat('Tongues', '/w ' + msg.who + ' Only the GM can access Tongues configuration commands!', null, {noarchive:true});
                    }
                } else if (command[3]) {
                    commandSpeak(msg, command);
                } else {
                    sendChat('Tongues', '/w ' + msg.who + ' Invalid command!', null, {noarchive:true});
                }
            } else {
                sendChat('Tongues', '/w ' + msg.who + ' Invalid command!', null, {noarchive:true});
            }
        }
    },
    
    //---- PUBLIC FUNCTIONS ----//
    
    dLog = function(message){
        if (devMode) log(message);
    },
    
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
