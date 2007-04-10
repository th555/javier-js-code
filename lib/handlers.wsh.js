/*------------------------------------------------------------------------
  File:        handlers.wsh.js
  Description: JAVIER Handlers JScript version
  Author:      Edgar Medrano P�rez 
               edgarmedrano at gmail dot com
  Created:     2007.04.04
  Company:     JAVIER project
               http://javier.sourceforge.net
  Notes:       
------------------------------------------------------------------------*/

function NetHandler() {
	var xmlhttp;

	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	this.load = function 
			(__type
			,__url
			,__method
			,__enctype
			,__objRef
			,__processFun
			,__statusFun
			,__timeout
			,__maxage
			,__maxstale) {
		var __url_parts = __url.split("\?");
		__method = __method ? __method : "GET";
		__enctype = __enctype ? __enctype : "";
		__timeout = __timeout ? __timeout : 0;
		
	    if (__url.length >= 2083) {
			__method = "POST";
		}
		
		if(__method == "POST") {
			xmlhttp.open("POST", __url_parts[0], true);
			if(!__enctype) {
				xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
		} else {
			xmlhttp.open("GET", __url);		
		}
		
		if(__enctype) {
			xmlhttp.setRequestHeader("Content-Type", __enctype);
		} 
		
		if(!__maxage) {
			xmlhttp.setRequestHeader("Cache-Control","must-revalidate");
	    } else {
			xmlhttp.setRequestHeader("Cache-Control","max-age=" + __maxage);
		}

		if(__maxstale) {
			xmlhttp.setRequestHeader("Cache-Control","max-stale=" + __maxage);		
		}
		
		if(__processFun) {
			if(__timeout > 0) {
				__timeout = setTimeout(function () {
							if (xmlhttp.readyState != 4) {
								xmlhttp.abort();
								__processFun("error.badfetch.timeout",__objRef);
							}
						}
					,__timeout);
			}
			
		    xmlhttp.onreadystatechange = function() { 
				if (xmlhttp.readyState == 4) {    	    	
					if(xmlhttp.status == 200) {
						if(__type == "xml") {
							__processFun(xmlhttp.responseXML,__objRef); 		     
						} else {
							__processFun(xmlhttp.responseText,__objRef); 		     						
						}
					} else {	
						__processFun("error.badfetch.http." + xmlhttp.status,__objRef);
					}
				} else {
					__statusFun(__objRef,xmlhttp.readyState)
				}
		    }   
		}
		
	    if (__url_parts.length > 1) {
		   xmlhttp.send(__url_parts[1]);
	    }else{
	       xmlhttp.send("");
		} 
		
		if(__processFun) {
			return true;
		}

		if(__type == "xml") {
			return xmlhttp.responseXML;
		} 
		
		return xmlhttp.responseText;
	}
	
	this.loadXML = function 
		(__url
		,__method
		,__enctype
		,__objRef
		,__processFun
		,__statusFun
		,__timeout
		,__maxage
		,__maxstale
		) {
		this.load
			("xml"
			,__url
			,__method
			,__enctype
			,__objRef
			,__processFun
			,__statusFun
			,__timeout
			,__maxage
			,__maxstale
			);
	}

	this.loadText = function 
		(__url
		,__method
		,__enctype
		,__objRef
		,__processFun
		,__statusFun
		,__timeout
		,__maxage
		,__maxstale
		) {
		this.load
			("text"
			,__url
			,__method
			,__enctype
			,__objRef
			,__processFun
			,__statusFun
			,__timeout
			,__maxage
			,__maxstale
			);
	}
	
	this.getXML = function () { return xmlhttp.responseXML; }
	this.getText = function () { return xmlhttp.responseText; }
}

function WSInHandler() {
	this.getInput = 
		function (text,value) {
			return WScript.StdIn.ReadLine();
		}
}

function WSOutHandler(voiceName) {
	var TTSHandler = false;
	
	try {
		TTSHandler = new ActiveXObject("Sapi.SpVoice");
		this.setVoice = function (voiceName) {
			var TTSVoices = TTSHandler.GetVoices();
			
			for(var i=0; i < TTSVoices.Count; i++) {
				if(TTSVoices.Item(i).GetDescription().indexOf(voiceName) >= 0) {
					TTSHandler.Voice = TTSVoices.Item(i);
					return true;
				}
			}
			
			return false;
		}
		
		this.getVoices = function () {
			return TTSHandler.GetVoices();
		}
	} catch(e) {
		this.setVoice = function () { return true; }
		this.getVoices = function () { return { Count: 0 };	}
	}	

	this.addText = function (text) {
		if(TTSHandler) {
			try {
				TTSHandler.Speak( text, 1 );
			} catch(exception) {
				WScript.Echo("Speak error");
			}
		}
		WScript.Echo(text);
	}
	
	this.clearText = function () {
		if(TTSHandler) {
			try {
				TTSHandler.Speak("", 2);
			} catch(exception) {
				//WScript.Echo("Speak error");
			}
		}
	}

	this.waitUntilDone = function(msTimeout) {
		msTimeout = msTimeout ? msTimeout : -1;
		if(TTSHandler) {
			try {
				TTSHandler.WaitUntilDone(msTimeout);
			} catch(exception) {
				//WScript.Echo("Speak error");
			}
		}	
	}
	
	if(voiceName) {
		this.setVoice(voiceName);
	}
}

function WSLogHandler(logFile) {
	this.fso = new ActiveXObject("Scripting.FileSystemObject");
	this.logFile = logFile;

	this.writeln = function (text) {
		try {
			var f = this.fso.CreateTextFile(this.logFile,true /*for appending*/);
			f.WriteLine(text);
			f.Close();
		} catch(write_error) {
		    
		}
	}
}

function WSErrHandler() {
	this.writeln = function (text) {
		WScript.Echo(text);
	}
}