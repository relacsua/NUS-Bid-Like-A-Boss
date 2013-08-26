var numOfDays = 6;
var minimum1000LvlModuleReq = 60;
var week = {
	'MONDAY':0,
	'TUESDAY':1,
	'WEDNESDAY':2,
	'THURSDAY':3,
	'FRIDAY':4,
	'SATURDAY':5
};

function createTable(){
	var table = [];
	for(var i=0;i<numOfDays	;i++){
		// from 0800 to 0000 
		// one index represents 30 mins gap
		table[i] = new Array(32);
	}

	for(var i=0;i<numOfDays	;i++){
		for(var j=0;j<32;j++){
			table[i][j] = 0
		}
	}
	return table;
}
// returns the index of the table
function index(time){
	var hour = 0;
	var start = 800;
	var end = parseInt(time);
	if(end%100){end -= 30;hour += 0.5;}
	hour += (end-start)/100;
	return hour*2;
}

function print(tb){
	for(var i=0;i<numOfDays	;i++){
		var content = '';
		for(var j=0;j<32;j++){
			content += tb[i][j] + '  ';
		}
		$('div.info').append('<p>' + content + '</p>');
	}
}

function populateTable(table,list){
	for(var i=0;i<list.length;i++) {
		var mod_code = list[i].label;
		for(var j=0;j<list[i].lectures.length;j++){
			for(var k=0;k<module.cors[mod_code].lectures.length;k++) {
				if(list[i].lectures[j].group == module.cors[mod_code].lectures[k].group && list[i].lectures[j].type.toUpperCase() == module.cors[mod_code].lectures[k].type){
					var start_time = module.cors[mod_code].lectures[k].start;
					var end_time = module.cors[mod_code].lectures[k].end;
					var day = module.cors[mod_code].lectures[k].day;
					for(var l=index(start_time);l<index(end_time);l++){
						table[week[day]][l] = 1; // occupied slot
					}
				}
			}
		}
		for(var j=0;j<list[i].tutorials.length;j++){
			for(var k=0;k<module.cors[mod_code].tutorials.length;k++) {
				if(list[i].tutorials[j].group == module.cors[mod_code].tutorials[k].group && list[i].tutorials[j].type.toUpperCase() == module.cors[mod_code].tutorials[k].type){
					var start_time = module.cors[mod_code].tutorials[k].start;
					var end_time = module.cors[mod_code].tutorials[k].end;
					var day = module.cors[mod_code].tutorials[k].day;
					for(var l=index(start_time);l<index(end_time);l++){
						table[week[day]][l] = 1; // occupied slot
					}
				}
			}
		}	

	}
}

function checkIfFits(tb,start_time,end_time,day){

	var fits = true;
	for(var i=index(start_time);i<index(end_time) && fits;i++){
		if(tb[week[day]][i] == 1) {
			fits = false;
		}
	}
	return fits;
}

function moduleChecker(tb,key){

	var fits = true;
	var i = 0;
	var mod_name = key;
	var lect = [];
	var tut = [];
	if(module.cors[key].lectures != undefined) {
		while(i<module.cors[key].lectures.length) {
			var curr_type = module.cors[key].lectures[i].type;
			var lectGrp = [];
			while(curr_type == module.cors[key].lectures[i].type) { 
				// This while loop is to seperate different type of classes within lecture 
				// group(e.g package lecture/tutorial class type under lectures)
				var curr_grp = module.cors[key].lectures[i].group;
				fits = true;
				while(module.cors[key].lectures[i].group == curr_grp && curr_type == module.cors[key].lectures[i].type){
					// This while loop is to group lecture groups that have lessons
					// on more than one day
					if(fits) { 
						var start_time = module.cors[key].lectures[i].start;
						var end_time = module.cors[key].lectures[i].end; 
						var day = module.cors[key].lectures[i].day;
						fits = checkIfFits(tb,start_time,end_time,day);
					}
					i++;
					
					if(i==module.cors[key].lectures.length ) break;
				} // end of while loop <comment to be deleted later>
				if(fits && curr_type == module.cors[key].lectures[i-1].type){lectGrp.push(curr_grp);}
				if(i==module.cors[key].lectures.length ) break;
			}

			if(lectGrp.length > 0) { 
				lect.push({type:curr_type,group:lectGrp});
			} else {
				lect.length = 0; //clears any info stored in lect
				break; // breaks out immediately if one group does not fit
			}
		}
	}

	if((lect.length != 0 || module.cors[key].lectures == undefined) && module.cors[key].tutorials != undefined){
		i=0;
		while(i<module.cors[key].tutorials.length) {
			var curr_type = module.cors[key].tutorials[i].type;
			var tutGrp = [];
			while(curr_type == module.cors[key].tutorials[i].type) { 
				
				var curr_grp = module.cors[key].tutorials[i].group;
				fits = true;
				while(module.cors[key].tutorials[i].group == curr_grp && curr_type == module.cors[key].tutorials[i].type){
					
					if(fits) { 
						var start_time = module.cors[key].tutorials[i].start;
						var end_time = module.cors[key].tutorials[i].end; 
						var day = module.cors[key].tutorials[i].day;
						fits = checkIfFits(tb,start_time,end_time,day);
					}
					i++;
					
					if(i==module.cors[key].tutorials.length ) break;
				} // end of while loop <comment to be deleted later>
				if(fits && curr_type == module.cors[key].tutorials[i-1].type){tutGrp.push(curr_grp);}
				if(i==module.cors[key].tutorials.length ) break;
			}

			if(tutGrp.length > 0) { 
				tut.push({type:curr_type,group:tutGrp});
			} else {
				tut.length = 0; //clears any info stored in tut
				break; // breaks out immediately 
			}
		}
	}
	// Either there are both tutorial and lecture slots OR only tutorials w/o lecture 
	// OR tut slots doesn't exists but lecture exists
	if(tut.length > 0 || (module.cors[key].tutorials == undefined && lect.length > 0))
		return {label: key,lectures: lect,tutorials:tut};
	else
		return null;
}

function generateRegex(pref_list){
	var re = "[A-Z]{1}\\d{4}[A-Z]?";
	var start = '';
	// considering only gem first
	if(pref_list.indexOf('GEM Grp A') >= 0 && pref_list.indexOf('GEM Grp B') >= 0){
		start = '(GE' + re + ')';
	}else if(pref_list.indexOf('GEM Grp A') >= 0){
		start = '(GE[A-Z]{1}\\d{1}[5,9]\\d{2}[A-Z]?)';
	}else if(pref_list.indexOf('GEM Grp B') >= 0){
		start = '(GE[A-Z]{1}\\d{1}[0,9]\\d{2}[A-Z]?)';
	}

	if(start !== '' && pref_list.indexOf('SSM') >= 0){
		start = start + '|(SS' + re + ')';
	}else if(pref_list.indexOf('SSM') >= 0){
		start = 'SS';
	}else if(pref_list.indexOf('UEM') >= 0 || pref_list.indexOf('Breadth') >= 0){
		start = '^$' // reaches here if UEM/Breadth is chosen
	}			
	return start;
}

function determineLevelOfModule(){
	var start = "[A-Z]{2,3}?";
	var end  = "\\d{3}[A-Z]?";
	var minimum = 1;
	if(parseInt(userProfile.Thousand) >= minimum1000LvlModuleReq)
		minimum = 2;
	var middle = '['+minimum+'-';
	var numOfYears = parseInt(userProfile.Year);
	switch(numOfYears){
		case 0:
			middle += '2]{1}';
			break;
		case 1:
			middle += '3]{1}';
			break;
		case 2:
			middle += '4]{1}';
			break;
		default:
			middle += '6]{1}';
			break;
	}
	return start+middle+end;
}

function moduleThatIsTaken(mod){
	// returns a list of modules that are similar
	// but has different codes
	var re = /[A-Z]{2,3}\d{4}[A-Z]?/g;
	var similarModules = module.cors[mod].label.match(re);
	for (var i = 0; i < similarModules.length; i++) {
		if(userProfile.Modules.indexOf(similarModules[i]) >=0) // does exist
			return true;
	};
	return false;
}

function precluded(mod){

	var re = /[A-Z]{2,3}\d{4}[A-Z]?/g;
	if(module.cors[mod].preclusion != undefined) 
		var listOfPrecludedMods = module.cors[mod].preclusion.match(re);
	else
		return false;
	if(listOfPrecludedMods === null) //special and complicated cases
		return false; // returns false just to be safe
	for(var i=0;i<listOfPrecludedMods.length;i++)
		if(userProfile.Modules.indexOf(listOfPrecludedMods[i]) != -1) // doesn't exist
			return true;
	return false;

}

function time(mod){
	var examOfMod = module.cors[mod].examTime;
	if(examOfMod !== undefined){ // special case: no exam
		var time = examOfMod.substring(examOfMod.indexOf('T')+1,examOfMod.indexOf(':'));
		var date = examOfMod.substring(0,examOfMod.indexOf('T'));
		time = parseInt(time);
		if(time < 13){
			return date + 'AM';
		}else if(time < 17){
			return date+'PM';
		}else{
			return date+'EVE';
		}
	}
	return 'NOEXAM';
}

function examClash(mod,list){

	var phase = time(mod);
	if(phase !== 'NOEXAM'){
		for(var i=0;i<list.length;i++){
			var phaseOfModChosen = time(list[i].label);
			if(phaseOfModChosen === phase)
				return true;
		}
	}
	return false;
}

function getFacultyOfMod(department){

	for(dept in module.departments){
		if(module.departments[dept].indexOf(department)>=0)
			return dept;
	}
}

function modIsBreadth(mod){

	if(!modIsUEM(mod))
		return false;
	else{
		var facultyOfModule = getFacultyOfMod(module.cors[mod].department);
		if(facultyOfModule === undefined) return true; //special case
		var facultyOfUser = userProfile.Faculty;
		// eligible for user to take mod as it doesn't belong to his fac
		return (facultyOfModule !== facultyOfUser); 
	}
}

//returns true if mod is uem
function modIsUEM(mod){
	return (module.cors[mod].types.indexOf('UEM') >= 0);
}

function timetable(pref_list,clone){
	modulesThatFit = [];
	var tb = createTable();
	populateTable(tb,allocModList);
	//print(tb);
	var uem = false;
	var breadth = false;
	if(pref_list.indexOf('UEM') >= 0){
		uem = true; //uem is also true when both uem and breadth are selected. Uem has precedence over breadth
	}else if(pref_list.indexOf('Breadth') >= 0){
		breadth = true;
	}
	var levelOfModule = new RegExp(determineLevelOfModule());
	var re = new RegExp(generateRegex(pref_list));
	for(key in module.cors){
		if(key.search(levelOfModule) != -1){
			// Filtering is most efficient in this order
			if(((uem && modIsUEM(key)) || (breadth && modIsBreadth(key)) || key.search(re) != -1 ) && !examClash(key,allocModList) && !moduleThatIsTaken(key) && !precluded(key)) {
				if(moduleChecker(tb,key) != null)
					modulesThatFit.push(moduleChecker(tb,key));	
			}
		}
	}
	displayOfResults(modulesThatFit,tb,clone);
}
