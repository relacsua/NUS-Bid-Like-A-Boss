// Following www.nusmods.com class types 
// to make timetable integration easier 
var classType = {
	"Design Lecture": 0,
	"Laboratory": 1,
	"Lecture": 2,
	"Packaged Lecture": 3,
	"Packaged Tutorial": 4,
	"Recitation": 5,
	"Sectional Teaching": 6,
	"Seminar-style Module Class": 7,
	"Tutorial": 8,
	"Tutorial Type 2": 9,
	"Tutorial Type 3": 'A'
};

//list of Selected Modules
var selectedModList = [];

//types of elec
	var elecTypeList = ['Breadth','GEM Grp A','GEM Grp B','UEM','SSM'];
	var titleForElecTypeList = ['','Science and Technology','Humanities and Social Science','Unrestricted Elective Module','Singapore Studies Module'];
function addNewFormElems(clone){

	// div to contains the items
	var div = $('<div></div>');
	div.addClass('mod-elec');
	// header
	div.append('<h4></h4>');
	div.find('h4').text('What type of module do 	you like to take ?');
	//check-box button
	var checkBox = $('<div></div>');
	checkBox.addClass('btn-group'); 
	checkBox.addClass('mod-pref');
	checkBox.attr('data-toggle','buttons-checkbox');
	for(var i=0;i<elecTypeList.length;i++){
		checkBox.append('<button></button>');
		checkBox.find('button:last').attr({
			type:'button',
			class:'btn',
			title: titleForElecTypeList[i]
		});
		checkBox.find('button:last').text(elecTypeList[i]);
	}
	div.append(checkBox);
	$('.row-fluid .info').append(div);

	var searchButton = $('<button></button>');
	var icon = $('<i></i>');
	icon.addClass('icon-search pull-right');
	searchButton.attr({
		class: 'btn btn-honey-pot-3',
		id: 'search-btn'
	});
	searchButton.append(icon);
	searchButton.append('Search');
	$('.mod-elec').append(searchButton);

	addEventForSearchButton(clone);
}

function makeInput(nam,val){
	var inputElem =$('<input></input>');
	inputElem.attr({
		type : 'hidden',
		name : nam,
		value : val,
		id : nam
	});
	return inputElem;
}

function addEventForSearchButton(clone){
	$('#search-btn').on('click',function(){
		// checks if button was selected
		if($('.mod-pref button.active').length === 0){
			var alertMsg = $('<div></div>');
			alertMsg.addClass('alert');
			alertMsg.addClass('alert-error');
			var alertBtn = $('<button></button>');
			alertBtn.attr({
				type:'button',
				class:'close',
			});
			alertBtn.attr('data-dismiss','alert');
			alertBtn.html('&times;');
			alertMsg.append(alertBtn);
			alertMsg.append("<strong>Hey!</strong> Don't you want to choose any modules.");
			$(this).before(alertMsg);
			window.setTimeout(function(){$('.alert').alert('close');},3000);
		} else {
			var listOfPref = [];
			$('.mod-pref button.active').each(function(){
				listOfPref.push($(this).text());
			});
			// removing elements to make way for new elements....
			$('form.form-horizontal div').remove();
			$('div.mod-elec').remove();
			$('div.mod-pane').remove();
			timetable(listOfPref,clone);
		}
	});
}


// All the functions below are for the display of the search results
/**********************************************************************************************************************/

// Functions takes the list of results and tb as its param
// also takes the clone of the allocated mod view to display
// if user wishes to search again
function displayOfResults(list,tb,clone){
	$('div.xtra').append(searchAgain()); // Button to search again
	evtForSearchAgainButton(clone); // evt binded to the above btn
	if(list.length === 0){
		$('.mod-form h4').text('Sorry. No results found. Search Again');
		return;	
	}
	// change of current elems
	$('.mod-form h4').text('Search Results');
	var btnDiv = $('<div></div>');
	btnDiv.addClass('buttons');
	$('div.info').append(btnDiv);
	var module_view_container = $('<div></div>');
	module_view_container.addClass('module-view-container');
	var mod_chosen = $('<div></div>');
	mod_chosen.addClass('mod-chosen');
	module_view_container.append(mod_chosen);
	$('div.xtra').append(module_view_container); 
	//appending form elements
	appendFormElem('mod-results','Module Code','span10','');
	for(var i=0;i<list.length;i++){
		if(i===0){appendOptions('');} //for place holder purpose
		var mod_code = list[i].label; 
		appendOptions(mod_code + ' ' + module.cors[mod_code].title);
	}
	$('#mod-results').select2({
		placeholder:'Choose Your Mods',
		allowClear: true
	});
	selectedModList = []; // initialising
	$('#mod-results').on('select2-selecting',function(e){
		// preparing for the reset
		clearAll();
		var table_view = $('<div></div>');
		table_view.addClass('table-view');
		var statistics = $('<div></div>');
		statistics.attr('id','statistics');
		$('div.module-view-container div.mod-chosen').before(createPillView(['table-view','stat-view'],['Module','Statistics'],[table_view,statistics]));
		$('div.module-view-container').addClass('box-border-shadow'); // Adding CSS
		//appending class sections
		var mod_name = e.val.split(' ')[0];
		var selected_mod;
		for(var i=0;i<list.length;i++){
			if(list[i].label === mod_name){
				selected_mod = list[i];
				break; 
			}
		}
		var lecture = selected_mod.lectures; 
		for(var j=0;j<lecture.length;j++){
			var type = toTitleCase(lecture[j].type);
			appendFormElem(lecture[j].type.replace(/\s/g,'-'),type,'span4','lecture');
			for(var k=0;k<lecture[j].group.length;k++){ 
				appendOptions(lecture[j].group[k]);
			}
			$('#' + lecture[j].type.replace(/\s/g,'-')).select2({minimumResultsForSearch:-1});
		}
		var tutorial = selected_mod.tutorials;
		for(var j=0;j<tutorial.length;j++){
			var type = toTitleCase(tutorial[j].type);
			appendFormElem(tutorial[j].type.replace(/\s/g,'-'),type,'span4','non-lecture');
			for(var k=0;k<tutorial[j].group.length;k++){ 
				appendOptions(tutorial[j].group[k]);
			}
			$('#' + tutorial[j].type.replace(/\s/g,'-')).select2({minimumResultsForSearch:-1});
		}
		// appending graph
		drawGraph('div#statistics','mod-stat',mod_name);
		correctLabel();
		// appending accordion
		$('div.module-view-container div.table-view').append(createAccordion('Module Information','Class Information',addDisplayModInfo(mod_name),tableForClass(mod_name)));
		// append buttons and its
		// event handler
		appendButtons();	
		evtForAddSelectedMod(list,tb);
		// change active elem for pill view
		$('.module-view-container div.pill-view ul.nav li:first').addClass('active');
		$('.module-view-container div.pill-view ul.nav li:last').removeClass('active');
		$('.module-view-container div.pill-content div.pill-pane:first').addClass('active');
		$('.module-view-container div.pill-content div.pill-pane:last').removeClass('active');
		// adding evt handler for hovering
		$('div.control-group:not(:first) select').on('select2-highlight',function(e){
			var length = $('div.control-group:not(:first)').length;
			// getting the index
			var index = $('div.control-group:not(:first) select').index(this);
			//clear any old info wrt to the highlighted class
			var elem = $('div.class-info-wrap div:nth-child('+(index+1)+')');
			elem.remove();
			// insert updated one
			var container = $('<div></div>');
			container.addClass('span' + Math.floor(12/length));
			var table = $('<table></table>');
			var row = $('<tr></tr>');
			var content = $('<td></td>');
			var type = $(this).attr('id').split('-')[0];
			var group = e.val;
			content.append(displayInfo(group,type,mod_name,'table-bordered table-striped'));
			row.append(content);
			table.append(row);
			container.append(table);
			if(length === 1){
				$('div.class-info-wrap').append(container);
			}else if(index === length-1){ 
				$('div.class-info-wrap div:nth-child('+index+')').after(container); //last elem
			}else{
				$('div.class-info-wrap div:nth-child('+(index+1)+')').before(container);
			}
		});
	});

	$('#mod-results').on('select2-removed',function(e){
		clearAll();
	}); 

}

function appendFormElem(id_name,label_name,length,classType){
	var control_group = $('<div></div>');
	control_group.addClass('control-group '+ classType);
	var label = $('<label></label>');
	label.attr({
		class:'control-label',
		for : id_name
	});
	label.text(label_name);

	var select = $('<select></select>');
	select.attr({
		name : id_name,
		id : id_name,
		class : length
	});
	control_group.append(label);
	control_group.append('<div></div>');
	control_group.find('div').addClass('controls');
	control_group.find('div').append(select);

	$('form.form-horizontal').append(control_group);
}

function appendOptions(label){
	var select = $('form.form-horizontal select:last');
	var option = $('<option></option>');
	option.text(label);
	select.append(option);
}

function clearAll(){
	var elemsToBeCleared = $('form.form-horizontal div.control-group');
	if(elemsToBeCleared.length > 1) {
		for(var i=1;i<elemsToBeCleared.length;i++){
			elemsToBeCleared[i].remove();
		}
	}
	$('div.module-view-container div.pill-view').remove();
	$('div.buttons').children().remove();
	if(selectedModList.length === 0){
		$('div.module-view-container').removeClass('box-border-shadow');
	}
}

// adds a table view for module info
function addDisplayModInfo(mod){
	var table = $('<table></table>');
	table.addClass('table table-bordered table-striped');
	var header_mod_info = ['label','title','description','examTime','mcs','prerequisite','preclusion','workload','department'];
	for(var i=0;i<header_mod_info.length;i++){
		var content_text = module.cors[mod][header_mod_info[i]];
		if(content_text !== undefined){
			var row = $('<tr></tr>');
			var header = $('<th></th>');
			var header_text;
			if(header_mod_info[i] === 'label'){
				header_text = 'Module Code';
			} else if(header_mod_info[i] === 'examTime'){
				var date = content_text.substring(0,content_text.indexOf('T'));
				var time = content_text.substring(content_text.indexOf('T')+1,content_text.indexOf('+'));
				if(parseInt(time.substring(0,2)) >= 13){
					time = parseInt(time.substring(0,2))-12 + time.substring(2) + ' pm';
				}else if(parseInt(time.substring(0,2)) >= 12){
					time += ' pm';
				}else{
					time += ' am';
				}
				content_text = date + ' '+ time;
				header_text = 'Exam';
			} else if(header_mod_info[i] === 'mcs'){
				header_text = 'Modular Credit';
			} else if(header_mod_info[i] === 'prerequisite'){
				header_text = 'Pre-requisite';
			} else{
				header_text = toTitleCase(header_mod_info[i]);
			}
			header.text(header_text);
			var content = $('<td></td>');
			content.text(content_text);
			row.append(header);
			row.append(content);
			table.append(row);
		}
	}
	return table;
}

// Adding tutorial lecture timing
function tableForClass(mod){
	var wrapper = $('<div></div>');
	wrapper.addClass('class-info-wrap');
	$('div.control-group:not(:first)').each(function(){
		var container = $('<div></div>');
		container.addClass('span' + Math.floor(12/$('div.control-group:not(:first)').length));
		var table = $('<table></table>');
		var row = $('<tr></tr>');
		var content = $('<td></td>');
		var type = $(this).find('select').attr('id').split('-')[0];
		var group = $(this).find('select').select2("val");
		content.append(displayInfo(group,type,mod,'table-bordered table-striped'));
		row.append(content);
		table.append(row);
		container.append(table);
		wrapper.append(container);
	});
	return wrapper;
}

function createAccordion(label1,label2,table1,table2){

	var wrapper = $('<div></div>');
	wrapper.attr({
		class: 'accordion',
		id: 'accordion2'
	});
	wrapper.append(accordionGrp(label1,table1,'collapseOne'));
	wrapper.append(accordionGrp(label2,table2,'collapseTwo'));
	wrapper.find('div.accordion-body:last').addClass('in');
	return wrapper;
}

function accordionGrp(label,table,hrefLink){
	var accordion_item = $('<div></div>');
	accordion_item.addClass('accordion-group');
	accordion_item.append(accordionHead(label,table,hrefLink));
	accordion_item.append(accordionBody(table,hrefLink));
	return accordion_item;
}

function accordionHead(label,table,hrefLink){
	var accordion_heading = $('<div></div>');
	accordion_heading.addClass('accordion-heading');
	accordion_heading.append(accordionAnchor(label,hrefLink));
	return accordion_heading;
}

function accordionAnchor(label,hrefLink){
	var anchor_tag = $('<a></a>');
	anchor_tag.attr({
		class:'accordion-toggle',
		'data-toggle':'collapse',
		'data-parent':'#accordion2',
		href: '#' + hrefLink
	});
	anchor_tag.text(label);
	return anchor_tag;
}

function accordionBody(table,hrefLink){
	var collapseItem = $('<div></div>');
	collapseItem.attr({
		id: hrefLink,
		class: 'accordion-body collapse'
	});
	var content = $('<div></div>');
	content.addClass('accordion-inner');
	content.append(table);
	collapseItem.append(content);
	return collapseItem;	
}

function appendButtons(){

	var add_button = $('<button></button>');
	var icon_add = $('<i></i>');
	var icon_info = $('<i></i>');
	icon_add.addClass('icon-plus-sign pull-left');
	icon_info.addClass('icon-info-sign pull-left');
	add_button.addClass('btn add-selected-mod btn-buoy-5');
	add_button.append(icon_add);
	add_button.append('Add');
	var link_button = $('<a></a>');
	link_button.append(icon_info);
	link_button.attr('target','blank');
	link_button.addClass('btn btn-primary');
	link_button.append('Check Timetable');
	$('div.buttons').append(link_button,add_button);
	// gets link when clicked
	link_button.on('click',function(){
		link_button.attr('href',getLink());
	});
}

function getLink(){

	var link = 'http://www.nusmods.com/#';

	var list = allocModList.concat(selectedModList); // making a copy here
	if(getModuleInView() !== null){
		list.push(getModuleInView());
	}
	// Pre allocated modules selected by user
	for(var i=0;i<list.length;i++){
		var module = list[i];
		var code = module.label;
		var lecture = module.lectures;
		var tutorial = module.tutorials;

		for(var j=0;j<lecture.length;j++){
			var type = lecture[j].type;
			var group = lecture[j].group;
			var type_code = classType[type];
			link += code+'='+type_code+group+'&';
		}

		for(var j=0;j<tutorial.length;j++){
			var type = tutorial[j].type;
			var group = tutorial[j].group;
			var type_code = classType[type];
			link += code+'='+type_code+group+'&';
		}

		if(lecture.length === 0 && tutorial.length === 0)
			link += code+'&';
	}

	return link.substring(0,link.length-1); // removing last occurence of '&'
}

function getModuleInView(){

	if($('div.control-group:first').find('select').select2('val') === null){
		return null;
	}
	var code = $('div.control-group:first').find('select').select2('val').split(' ')[0];
	
	var lect = [];
	$('div.control-group.lecture').each(function(){
		var info = {
			'type': $(this).find('label').text(),
			'group': $(this).find('select').select2('val')
		};
		lect.push(info);
	});
	var tut = [];
	$('div.control-group.non-lecture').each(function(){
		var info = {
			'type': $(this).find('label').text(),
			'group': $(this).find('select').select2('val')
		};
		tut.push(info);
	});

	return {'label':code,'lectures':lect,'tutorials':tut};
}

function evtForAddSelectedMod(list,tb){
	$('button.add-selected-mod').on('click',function(){
		var selectedMod = getModuleInView();
		if(selectedMod !== null) {
			selectedModList.push(selectedMod);
			updateOptions(list,tb);
			var tag = createTag(selectedMod.label);
			if(!$('div.mod-chosen').hasClass('well')){
				$('div.mod-chosen').addClass('well');
			}
			$('div.mod-chosen').append(tag);
			evtForTag(list,tb);
		}else{
			alert('You have already chosen that module');
		}
	});
}

function createTag(mod){
	var tag = $('<div></div>');
	tag.addClass('tag');
	tag.append(mod + ' ' + module.cors[mod].title);
	tag.append('<button class="close">&times;</button>');
	return tag;
}

function evtForTag(list,tb){
	$('div.tag').find('button.close').on('click',function(){
		// remove from list
		var mod_code = $(this).parent().text().split(' ')[0];
		for(var i=0;i<selectedModList.length;i++){
			if(selectedModList[i].label === mod_code){
				selectedModList.splice(i,1);	
				break;
			}
		}
		// update the module option
		updateOptions(list,tb);
		// remove from view
		$(this).parent().remove();
		if($('div.tag').length === 0 ){
			$('div.mod-chosen').removeClass('well');	
		}
		if($('div.tag').length === 0 && $('div.table-view').length === 0){
			$('div.module-view-container').removeClass('box-border-shadow');		
		}
	});
}

// takes modulesThatFit array as parameter and
// the table as param
function updateOptions(list,tb){
	var dupli_tb = createTable();
	for(var i=0;i<numOfDays;i++){ //makes a copy
		for(var j=0;j<32;j++){
			dupli_tb[i][j] = tb[i][j];
		}
	}

	populateTable(dupli_tb,selectedModList); //update it
	for(var i=0;i<list.length;i++){
		if($('div.control-group:first select option:nth-child('+(i+2)+')').prop('disabled')){
			$('div.control-group:first select option:nth-child('+(i+2)+')').removeAttr('disabled');
		}
		if(examClash(list[i].label,selectedModList) || moduleChecker(dupli_tb,list[i].label) === null){
			$('div.control-group:first select option:nth-child('+(i+2)+')').attr('disabled','');
		}else{ // Updates the tutorial section too
			var mod = moduleChecker(dupli_tb,list[i].label); 
			if(mod.label === list[i].label){
				list[i] = mod;
			}
		}
	}
}

function searchAgain(){
	var search = $('<div></div>');
	search.addClass('search-again-wrapper');
	var btn = $('<button></button>');
	btn.addClass('btn search-again btn-honey-pot-3');
	var icon = $('<i></i>');
	icon.addClass('icon-search pull-right');
	btn.append(icon);
	btn.append('Search Again');
	search.append(btn);
	return search;
}

function evtForSearchAgainButton(clone){
	$('button.search-again').on('click',function(){
		$('div#mod-filter').detach();
		$('div.tab-content div#mod-manager').before(clone);
		$('select#mod-code').select2({placeholder : 'Choose Your Mods',allowClear:true});
	});	
}

function createPillView(idList,pillList,contentList){
	var view = $('<div></div>');
	view.addClass('pill-view');
	view.append(createNav(idList,pillList));
	view.append(createPillContent(idList,contentList));
	// Arbitrarily choosing the last pill to be active
	view.find('ul li:last').addClass('active'); 
	view.find('div.pill-pane:last').addClass('active');
	return view;
}

function createNav(idList,pillList){
	var list = $('<ul></ul>');
	list.addClass('nav nav-pills');
	
	for(var i=0;i<idList.length;i++){
		var listItemOne = $('<li></li>');
		var anchorOne = $('<a></a>');
		anchorOne.attr({
			href:'#'+idList[i],
			'data-toggle': 'pill'
		});
		anchorOne.text(pillList[i]);
		listItemOne.append(anchorOne);
		list.append(listItemOne);
	}
	return list;
}

function createPillContent(idList,contentList){
	var wrapper = $('<div></div>');
	wrapper.addClass('pill-content');

	for(var i=0;i<idList.length;i++){
		var containerOne = $('<div></div>');
		containerOne.addClass('pill-pane');
		containerOne.attr('id',idList[i]);
		containerOne.append(contentList[i]);
		wrapper.append(containerOne);
	}
	return wrapper;
}

function drawGraph(selectorApendingTo,idOfClassAppended,mod){
	var caption = $('<div></div>');
	caption.addClass('caption-graph');
	caption.text('The Average Bidding History of ' + mod);
	$(selectorApendingTo).append(caption);
	var stat_view = $('<div></div>');
	stat_view.attr('id',idOfClassAppended);
	$(selectorApendingTo).append(stat_view);
	var data = getData(mod);
	if(data.length !== 0){
		var elem = new Morris.Line({
			element: idOfClassAppended,
			data: data,
			xkey: 'year',
		    ykeys: ['P','G'],
		    labels: ['P Acc','G Acc'],
			lineColors:['crimson','darkslategray']
		});
	} else { // disables 'Statistics' tab if no info
		$('.module-view-container ul.nav.nav-pills li:last').addClass('disabled');
		$('.module-view-container ul.nav.nav-pills li:last a').attr('title','No Stats');
		$('.module-view-container ul.nav.nav-pills li:last').click(false);
	}
	correctLabel('#statistics');
}

function getData(mod){
	var data = [];
	for(var i=average_bid_points.length-1;i>=0;i--){
		if(average_bid_points[i].info[mod] !== undefined) {	
			var p_acc = average_bid_points[i].info[mod].P;
			var g_acc = average_bid_points[i].info[mod].G;
			var year = average_bid_points[i].year.substring(0,4);
			year += (average_bid_points[i].semester === '1')? ' Q0' : ' Q2'; 
			data.push({
				'year' : year,
				'P': p_acc,
				'G': g_acc
			});
		}
	}
	return data;
}

// function correctLabel and initLabel are to change the label of the graph when hovered
// changes Q0 to sem 1 and Q2 to sem 2
// There should be better way of solving this issue
function correctLabel(id){
	initLabel();
	var html = $(id+' div.morris-hover-row-label').html();
	setInterval(function(){
		var curr =  $(id +' div.morris-hover-row-label').html();  
		if(curr !== undefined && curr !== html && curr.split(' ')[1] !== 'Sem'){
				initLabel(id);
				html = $(id + ' div.morris-hover-row-label').html(); 
			} 
	}, 1); 
}

function initLabel(id){
	var text = $(id+' div.morris-hover-row-label').text();
	var semester;
	if(text.split(' ')[1] === 'Q0'){
		semester = ' Sem 1';
	}else{
		semester = ' Sem 2';
	}
	$(id+' div.morris-hover-row-label').text($(id+' div.morris-hover-row-label').text().split(' ')[0] + semester);
}

