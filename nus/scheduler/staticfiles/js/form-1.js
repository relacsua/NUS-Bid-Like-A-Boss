// Info stored is for form-sending purposes in the following style
/*
 * allocModList |
 *      		---> label  [Module Code]
 *				---> lectures |
 *							  ---> type [type of lecture e.g Sectional Teaching, Seminar Style Module Class,etc..]
 *							  ---> group [class]
 *				---> tutorials |
 *							  ---> type [type of tutorial e.g Design Lecture, etc..]
 *							  ---> gorup [class]
 */ 
var allocModList = [];

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function addLecture(moduleChosen){
	var elemForm; 
	var currModule = module.cors[moduleChosen].lectures;
	if(currModule != undefined){
		var i = 0;
		while(i < currModule.length ){
			var hasExited = true;
			var type = currModule[i].type;
			var id = moduleChosen + '-' + type;
			elemForm = $('<div id=' + id + '></div>');
			elemForm.addClass('control-group');

			elemForm.addClass('lecture');
			$('.mod-info').append(elemForm);
			elemForm.append('<label>' + toTitleCase(type) + '</label>');
			elemForm.find('label').addClass('control-label');
			elemForm.append('<div></div>');
			elemForm.find('div:last').addClass('controls');
			elemForm.find('.controls').append('<select id="class"></select>');
			elemForm.find('select').addClass('span4');
			var currGrp = currModule[i].group;
			while(i < currModule.length){
				if(type != currModule[i].type) break;
				if(i===0 || ((hasExited) || (currGrp != currModule[i].group))){
					elemForm.find('select:last').append('<option>' + currModule[i].group + '</option>');
					currGrp = currModule[i].group;	
				}
				hasExited = false;
				i++;
			} 
		}
	}
}

function addRest(moduleChosen){
	var elemForm; 
	var currModule = module.cors[moduleChosen].tutorials;
	if(currModule != undefined){
		var i = 0;
		while(i < currModule.length ){
			var hasExited = true;
			var type = currModule[i].type;
			var id = moduleChosen + '-' + type;
			elemForm = $('<div id=' + id + '></div>');
			elemForm.addClass('control-group');
			elemForm.addClass('non-lecture');
			$('.mod-info').append(elemForm);
			elemForm.append('<label>' + toTitleCase(type) + '</label>');
			elemForm.find('label').addClass('control-label');
			elemForm.append('<div></div>');
			elemForm.find('div:last').addClass('controls');
			elemForm.find('.controls').append('<select id="class"></select>');
			elemForm.find('select').addClass('span4');
			while(i < currModule.length){
				if(type != currModule[i].type) break;
				if(i===0 || ((hasExited) || (currGrp != currModule[i].group))){
					elemForm.find('select:last').append('<option>' + currModule[i].group + '</option>');
					currGrp = currModule[i].group;	
				}
				hasExited = false;
				i++;
			} 
		}
	}
}

function addButton(){
	removeButton();
	var icon = $('<i></i>');
	icon.addClass('icon-plus-sign pull-left');
	var addModuleButton = $('<button></button>');
	addModuleButton.addClass('btn btn-buoy-5');
	addModuleButton.append(icon);
	addModuleButton.append('Add Module');
	$('.btn-add').append(addModuleButton);
	addEventForButton(addModuleButton);
}

function removeButton(){
	$('.btn-add').find('button').remove();
}

function clearForm(){$('.mod-info').find('div').remove();}

function clearInfoDisplay(){
	$('.mod-info-display').find('span').remove();
	$('.mod-info-display').find('table').remove();
}

function selectize(){
	$('.mod-info').find('select').each(function(){
		$(this).select2({minimumResultsForSearch:-1});
	});
}

function displayInfo(group,type,moduleChosen,classDetails){
	var infoElem = $('<table></table>');
	var tableHead = ['Group','Type','Week','Day','Time','Venue'];
	infoElem.addClass('table');
	infoElem.addClass(classDetails);
	for(var i=0;i<6;i++) infoElem.append('<tr>');
	for(var i=0;i<6;i++) infoElem.find('tr:nth-child('+(i+1)+')').append('<th>'+tableHead[i]+':</th>');	
	if(type === 'LECTURE' || type === "SECTIONAL" || type === "SEMINAR" || type == "PACKAGED"){ //lectures
		var currModule = module.cors[moduleChosen].lectures;
		for(var i=0;i<currModule.length;i++){
			if(currModule[i].group === group){
				var iter = 1; //colspan width
				content = '';
				for(key in currModule[i]){
					if(key ==='start'){
						content = currModule[i][key];
						continue;
					}else if(key === 'end'){
						content += ' - ' + currModule[i][key];
					}else{
						content = (key !== 'room' && key !== 'group') ? toTitleCase(currModule[i][key]) : currModule[i][key];
					}
					if(infoElem.find('tr:nth-child('+iter+') td:last').html() !== content) {
						infoElem.find('tr:nth-child('+iter+')').append('<td colspan='+1+'>' + content  + '</td>');
						
					} else{						
						infoElem.find('tr:nth-child('+iter+') td').attr('colspan',parseInt(infoElem.find('tr:nth-child('+iter+') td').attr('colspan'))+1);
					}
						
					iter++;
				}
			}
		}
	}else{ //tutorials
		var currModule = module.cors[moduleChosen].tutorials;
		for(var i=0;i<currModule.length;i++){
			if(currModule[i].group === group && currModule[i].type.split(' ')[0] === type){
				var iter = 1;
				content = '';
				for(key in currModule[i]){
					if(key ==='start'){
						content = currModule[i][key];
						continue;
					}else if(key === 'end'){
						content += ' - ' + currModule[i][key];
					}else{
						content = (key != 'room' && key != 'group') ? toTitleCase(currModule[i][key]) : currModule[i][key];
					}
					if(infoElem.find('tr:nth-child('+iter+') td:last').html() != content) {
						infoElem.find('tr:nth-child('+iter+')').append('<td colspan='+1+'>' + content  + '</td>');
						
					} else{						
						infoElem.find('tr:nth-child('+iter+') td').attr('colspan',infoElem.find('tr:nth-child('+iter+') td').attr('colspan')+1);
					}
						
					iter++;
				}
			}
		}
	}
	return infoElem;
}

function addEventForFormElem(moduleChosen){
	// Event Number 3 - Display Info about the Tut/Lec/etc..
	$('.mod-info .controls select#class').on('select2-highlight',function(e){
		clearInfoDisplay();
		var type = $(this).closest('.control-group').attr('id').split('-')[1];
		var infoElem = displayInfo(e.val,type,moduleChosen,'table-striped table-bordered table-condensed');
		$('.mod-info-display').append(infoElem);
	});
	// Event Number 5 - Shows default message on Info Display
	$('.mod-info .controls select#class').on('select2-close',function(e){
		prepareInfoDisplay();
	});
}

function addEventForModuleTags(){
	// Event Number 6 - When a tag is removed
	// It is removed from the view and allocModList  
	$('.mod-pane').find('button.close').on('click',function(event){
		var modToDelete = $(this).closest('td').text().split(' ')[0];
		$(this).closest('tr').remove();
		var modFound = false;
		for(var i=0;i<allocModList.length && !modFound;i++){
			if(allocModList[i].label === modToDelete){
				allocModList.splice(i,1);
				modFound = true;
			}
		}
		// Removes Button if no tags
		if(allocModList.length === 0){
			$('.mod-pane').find('button').remove();
			$('.mod-pane').removeClass('well');
		}

		// appends the option back to select list in its place -- not a efficient sort
		var textToAppend = module.cors[modToDelete].label + ' ' + module.cors[modToDelete].title;
		var foundSpot = false;
		$('#mod-code option').each(function(i){
			if($(this).text() === textToAppend) return false;
			if($(this).text() > textToAppend && !foundSpot ){
				$(this).before('<option>' + textToAppend + '</option>');
				foundSpot = true;
			}
			if(!foundSpot && i === $('#mod-code option').length){ // last option
				$('#mod-code').append('<option>' + textToAppend + '</option>');
			}
		});
			
	});
}
// thisbutton refers to confirm allocated
// module button 
function addEventForThisButton(){
	var btn = $('.mod-pane button');
	btn.on('click',function(){
		// clones the tab so that user can restore it later
		$('select#mod-code').select2('destroy');
		var clone = $('div#mod-filter').clone('true');
		
		$('select#mod-code').select2({placeholder : 'Choose Your Mods',allowClear:true});
		// remove itself
		$(this).remove();
		// Include a label
		$('.mod-pane table').before('<h4>Module(s) Allocated</h4>');
		// Remove x from tags
		$('.mod-pane table tbody tr td button.close').each(function(){
			$(this).remove();
		});
		// fade out the tags to give a disabled feel
		$('.mod-pane table td').css('background-color','rgba(237, 20, 61, 0.71)');
		// disable first form element and deselects
		$('#mod-code').select2('enable',false);
		$("#mod-code").select2("val", "");
		//removes other form elements if selected
		$('div#contain').remove();
		//removes display if active
		$('.mod-info-display').remove();
		// add new elements
		addNewFormElems(clone);
	});	
}

function addModuleButton(){
	if(allocModList.length === 0){
		var icon = $('<i></i>');
		icon.addClass('icon-thumbs-up-alt pull-right');
		var addBtn = $('<button></button>');
		addBtn.addClass('btn btn-buoy-2');
		addBtn.append(icon);
		addBtn.append('Confirm Modules');
		$('.mod-pane table').before(addBtn);
		addEventForThisButton();
	}
}

// When function is called, fn executes 2 things
// 1. Puts info together so that User is able to view the module added
// 2. Stores info in an array so that info can be send over to server
// 3. Removes selected option
// This event is not only binded to the button, it is also binded to
// the main form element. Currently, solving this problem unelegantly
// (LOOK AT THE IF STATEMENT)
function addEventForButton(button){
	// Event Number 4 - Adds Module chosen
	// along with tut/lab/etc.. info
	button.on('click',function(){
		
		var content = ''; //content holds info to be printed on the page for the user to see
						 //module-info
		var moduleInfo;	
		content += $('.control-group:first select').select2('val');
		moduleInfo = $('.control-group:first select').select2('val').split(' ')[0];

		$('#mod-code option').each(function(){
			if($(this).text() === content){
				$(this).remove();
			} 
		});
		
		//Lecture Info
		var lec = [];
		$('.mod-info').find('div.lecture').each(function(){
			var l = {
				type: $(this).find('label').text(),
				group: $(this).find('span').text()
			};
			lec.push(l);
		});
		
		// Other Info
		var tut = [];
		$('.mod-info').find('div.non-lecture').each(function(){
			var t = {
				type:$(this).find('label').text(),
				group: $(this).find('span').text()
			};
			tut.push(t);
		});

		var allInfo = {
			label : moduleInfo,
			lectures: lec,
			tutorials: tut, 
		};

		$('.mod-pane').addClass('well');
		addModuleButton();
		$('.mod-pane table').append('<tr><td>' + content + '</td></tr>');
		$('.mod-pane table tbody tr:last td').append('<button>&times;</button>');
		$('.mod-pane table tbody tr:last td').find('button').addClass('close');
		addEventForModuleTags();
		allocModList.push(allInfo);

		$('#mod-code').trigger('select2-removed');
		$("#mod-code").select2("val", "");
	});
}

function prepareInfoDisplay(){
	clearInfoDisplay();
	$('.mod-info-display').css('display','block');
	$('.mod-info-display').append('<span id="display-info">Hover over the class to get info</span>');
}

// Gets a module code as param
// Then adds respective form elements
// for tutorial,lecture,etc.. slots
function addFormElem(moduleChosen){
	clearForm();
	var moduleCode = moduleChosen.split(' ')[0];
	addLecture(moduleCode);
	addRest(moduleCode);
	addButton();
	selectize();
	prepareInfoDisplay();
	addEventForFormElem(moduleCode);
}


$(function(){
	// Populating the the textbox with modules
	for(key in module.cors){
		var content = module.cors[key].label + ' ' + module.cors[key].title;
		var mod = $('<option>' + content + '</option>');
		$('#mod-code').append(mod);
	}
	$('#mod-code').select2({placeholder : 'Choose Your Mods',allowClear:true});
});

$(function(){
	// Event Number 1 - When user selects a module
	$('#mod-code').on('select2-selecting',function(e){
		var moduleChosen = e.val;
		addFormElem(moduleChosen);
	});
	// Event Number 2 - Clears the form if there is one
	$('#mod-code').on('select2-removed',function(e){
		clearForm();
		clearInfoDisplay();
		removeButton();
		$('.mod-info-display').css('display','none');
	});
});
