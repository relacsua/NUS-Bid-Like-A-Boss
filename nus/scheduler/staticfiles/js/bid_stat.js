var bid_points;

$(function(){
	evtForSearch();
});

function evtForSearch(){ 
	$('form#mod-stat-search').submit(function(e){
		e.preventDefault();	
		var queryRe = /^[A-Z]{2,3}\d{4}[A-Z]?$/;
		var query = $('input#mod-query').val();
		query = query.toUpperCase();
		if(queryRe.test(query)){
			removeDynamicItems();
			disableSearchButton();
			$.ajax({ 
				dataType:'json',
				url: 'get/data/',
				data:{modname:query},
				success: function(data){
					bid_points = data;
					if(bid_points.length !== 0){
						bidStats(query);			
					}else{
						addWarningIcon();
					}
				}
			});
			ableSearchButton();	
		}else{
			if($('.search-box div.alert.alert-error').length === 0)
				showErrorMsg();
		}		
	});
}

function extractInfo(mod_name){
	var data = [];
	var moduleFound = false;
	for(var i=0;i<bid_stats_all.length;i++){
		var bidToSend = [];
		var semester = bid_stats_all[i].Semester;
		var year = bid_stats_all[i].Year;
		var bid = bid_stats_all[i].Bid;
		for(var j=0;j<bid.length;j++){
			var round = bid[j].Round;
			var module = bid[j].Info[mod_name];
			var modToSend = {};
			if(module !== undefined){
				modToSend[mod_name] = module;
				moduleFound = true;
			}
			var InfoToSend = {'Round':round,'Info':modToSend};
			bidToSend.push(InfoToSend);
		}
		data.push({'Bid':bidToSend,'Semester':semester,'Year':year});
	}
	return (moduleFound)? data:[];
}

function showErrorMsg(){
	var alert = $('<div></div>');
	alert.addClass('alert alert-error fade in');
	alert.append('Please type a valid module code');
	$('form#mod-stat-search').after(alert);
	window.setTimeout(function(){$('.alert').alert('close');},2000);
}

function addWarningIcon(){
	var warnDiv = $('<div></div>');
	warnDiv.attr('id','warning');
	warnDiv.append('<i style = "padding-top:3px"class="icon-warning-sign icon-2x">');
	var text = $('<span> No Module Found. Search Again.</span>');
	text.css('font-size','28px');
	warnDiv.append(text);
	warnDiv.css({'text-align':'center',
				 'position' : 'absolute',
				 'left' : '33%',
				 'top' : '50%'
				});
	$('form#mod-stat-search').after(warnDiv);
	return warnDiv;
}

function disableSearchButton(){
	$('form#mod-stat-search button').attr('disabled','disabled');
	$('form#mod-stat-search button').addClass('disabled');
}

function ableSearchButton(){
	$('form#mod-stat-search button').removeAttr('disabled');
	$('form#mod-stat-search button').removeClass('disabled');
}

function removeDynamicItems(){
	// remove warning button 
	$('#warning').remove();
	// remove main stat view
	$('.stats-body').contents().remove();
	// remove button
	$('.radio-btn').contents().remove();
}

function bidStats(mod){
	initBidStatsPillView(mod);
	$('.radio-btn').append(insertButtons(mod));
	initGraph('1A','round','Lowest successful bid',mod);
	evtForRoundPills(mod);
	evtForYearPills(mod);
}

function initBidStatsPillView(mod){
	var rounds = ['1A','1B','1C','2A','2B','3A','3B'];
	var years = [];
	var yearsIdList = [];
	for(var i=0;i<bid_points.length;i++){
		years.push(bid_points[i]['Year'] + ' Sem ' + bid_points[i]['Semester']);
		yearsIdList.push(bid_points[i]['Year'].substring(0,4) + '-Sem' + bid_points[i]['Semester']);
	}
	var round_view_content = [];
	for(var i=0;i<rounds.length;i++){
		var round_view = $('<div></div>');
		round_view.addClass('stat-viewer');
		round_view.attr('id','stat-'+rounds[i]);
		round_view_content.push(round_view);
	}
	var year_view_content = [];
	for(var i=0;i<bid_points.length;i++){
		var year_view = $('<div></div>');
		year_view.addClass('stat-viewer');
		year_view.attr('id','stat-'+yearsIdList[i]);
		year_view_content.push(year_view);
	}	
	var year_view = createPillView(yearsIdList,years,year_view_content);
	var round_view = createPillView(rounds,rounds,round_view_content);
	var main_view = createPillView(['round-view','year-view'],['Round','Year'],[round_view,year_view]);
	$('div.stats-body').append(main_view);
	// init the look
	$('div.stats-body>.pill-view>ul>li:last').removeClass('active');
	$('div.stats-body>.pill-view>ul>li:first').addClass('active');
	$('#round-view').addClass('active');
	$('#year-view').removeClass('active');
	$('#round-view li:first').addClass('active');
	$('#round-view li:last').removeClass('active');
	$('#round-view .pill-pane:last').removeClass('active');
	$('#round-view .pill-pane:first').addClass('active');
	$('.stats-body>.pill-view').addClass('box-border-shadow'); //adding css

	addEvtForMainPills(mod);
}

function insertButtons(mod){
	var btns = $('<div></div>');
	btns.attr({
		class: 'btn-group',
		'data-toggle': 'buttons-radio',
		'id': 'view-pref'
	});
	var btn_names = ['Quota','No of bidders','Lowest bid','Lowest successful bid','Highest bid'];
	var icon_class = ['icon-group','icon-user','icon-tint','icon-bullseye','icon-hand-up'];
	for(var i=0;i<5;i++){
		var button = $('<button></button>');
		button.attr({
			type: 'button',
			class: 'btn',
			title: btn_names[i]
		});
		button.append('<i class=' + icon_class[i] + '></i>');
		if(btn_names[i] === 'Lowest successful bid')
			button.addClass('active');
		btns.append(button);
	}
	addEvtForRadioBtn(btns,mod);
	return btns;
}

function initGraph(name,type,typeOfInfo,mod){
	if(type === 'round'){
		var info = extractDataForRound(name,typeOfInfo,mod);
		drawGraphForBidStats('stat-'+name,info);
		correctLabel('#stat-'+name);
	}else if(type === 'year'){
		var idList = name.split(' ');
		var idTag = 'stat-' + idList[0].substring(0,4) + '-Sem' + idList[idList.length-1];
		var info = extractDataForYear(name,typeOfInfo,mod);
		drawGraphForBidStats(idTag,info);
		correctLabelForYear('#'+idTag);
	}
}

function drawGraphForBidStats(idTag,info){
	var data = info[0];
	for(var i=0;i<data.length;i++)
		if(data[i]['year'] === undefined)
			data.splice(i,1); // in case the round/year does not exist		
	var keys = info[1];
	var caption = info[2];
	if(keys.length !== 0){ // Solves the problem if faculty does not exist
		var elem = new Morris.Line({
			element: idTag,
			data: data,
			xkey: 'year',
		    ykeys: keys,
			labels: keys,
			axes: false,
			lineColors:['crimson','darkslategray','darkolivegreen','darkgoldenrod','darkcyan','tomato','darkslateblue','mediumvioletred']
		});
		insertCaption(idTag,caption);		
	}else{
		var noBid = $('<h1></h1>');
		noBid.append('Sorry, no bidding history ');
		noBid.append('<i class="icon-meh"></i>');
		if($('#'+idTag).css('position') !== 'relative'){
			$('#'+idTag).css('position','relative');
		}
		$('#'+idTag).append(noBid);
	}
}

function extractDataForRound(id,typeOfInfo,mod){
	// check if gem or ss
	var gemOrSs = false;
	if(mod.substring(0,2) == 'SS' || mod.substring(0,2) == 'GE')
		gemOrSs = true;
	var data = [];
	var round;
	var year;
	var sem;
	var keys = [];
	var bidType = typeOfInfo;
	var faculty = userProfile.Faculty; 
	var stuType = (userProfile.Year === '1')? 'New' : 'Returning';
	var caption = 'Bidding point ('+bidType+') of '+mod+' in Round ' + id + ' across the years for ' + stuType + ' students from ' + userProfile.Faculty;
	for(var i=0;i<bid_points.length;i++){
		var year_acc = {};
		for(var j=0;j<bid_points[i].Bid.length;j++){
			if(bid_points[i].Bid[j].Round === id){
				round = bid_points[i].Bid[j].Info[mod]; // Handles the issues of mod does not exist
				year = bid_points[i].Year;				// i.e when user keys wrong mod code
				sem = bid_points[i].Semester;
				sem = (sem === '1')? 'Q0' : 'Q2';
				year = year.substring(0,4) + ' '+ sem;
				year_acc['year'] = year;
				for(var lects in round){
					if(round[lects][stuType] !== undefined){
						if((gemOrSs && (id === '2A' || id === '2B' || id === '2C')) || id === '3A' || id === '3B'){
							for(key in round[lects][stuType])
								faculty = key;  // Anyone can bid in round 3A/3B
						}
						var point = round[lects][stuType][faculty]; // Handles the case even if fac does 
						for(var acc in point){									// not exist
							var lec_name = lects.split(' ');
							var label = lec_name[0].substring(0,3) + ' ' + lec_name[lec_name.length-1] + '-' + acc + ' Account';
							if(keys.indexOf(label) === -1) keys.push(label);
							year_acc[label] = point[acc][bidType];
						}
					}
				}
			}
		}
		data.push(year_acc);
	} 
		
	return [data,keys,caption];	
}

function evtForRoundPills(mod){
	$('#round-view a[data-toggle="pill"]').on('shown', function (e) {
		removeElem();
 		var curr_tab = e.currentTarget.childNodes[0].data; // activated tab
 		var type = $('#view-pref button.active').attr('title');
	 	initGraph(curr_tab,'round',type,mod);
	});
}
// id in the form of AY Sem eg. 2011/2012 Sem 2
function extractDataForYear(id,typeOfInfo,mod){
	var gemOrSs = false;
	if(mod.substring(0,2) == 'SS' || mod.substring(0,2) == 'GE')
		gemOrSs = true;
	var curr_year_sem = id.split(' ');
	var info;
	var curr_yr = curr_year_sem[0];
	var curr_sem = curr_year_sem[2];
	var bidType = typeOfInfo;
	var stuType = (userProfile.Year === '1')? 'New' : 'Returning';
	var caption = 'Bidding point ('+bidType+') of '+mod+' in ' + id + ' across the rounds for ' + stuType + ' students from ' + userProfile.Faculty;
	var round = {'1A':'1','1B':'2','1C':'3','2A':'4','2B':'5','2C':'6','3A':'7','3B':'8'};// workaround for the time prob with rounds with morris.js
	var data = [];
	var keys = [];
	var faculty = userProfile.Faculty;
	for(var i=0;i<bid_points.length;i++){
		if(bid_points[i].Year === curr_yr && bid_points[i].Semester === curr_sem){
			for(var j=0;j<bid_points[i].Bid.length;j++){
				var round_data = {};
				info = bid_points[i].Bid[j].Info[mod];
				var rnd = bid_points[i].Bid[j].Round;
				round_data['year'] = round[rnd];
				for(var lects in info){
					if(info[lects][stuType] !== undefined){
						if((gemOrSs && (rnd === '2A' || rnd === '2B' || rnd === '2C')) ||rnd === '3A' || rnd === '3B'){
							for(key in info[lects][stuType])
								faculty = key;  // Anyone can bid in round 3A/3B
						}
						var point = info[lects][stuType][faculty];
						for(var acc in point){
							var lec_name = lects.split(' ');
							var label = lec_name[0].substring(0,3) + ' ' + lec_name[lec_name.length-1] + '-' + acc + ' Account';
							if(keys.indexOf(label) === -1) keys.push(label);
							round_data[label] = point[acc][bidType];
						}
					}
				}
				data.push(round_data);
			}
			break; // can escape once right acad yr and sem is found
		}
	}
	return[data,keys,caption];
}

function evtForYearPills(mod){
	$('#year-view a[data-toggle="pill"]').on('shown', function (e) {
		removeElem();
 		var curr_tab = e.currentTarget.childNodes[0].data; // activated tab
 		var type = $('#view-pref button.active').attr('title');
	 	initGraph(curr_tab,'year',type,mod);
	});	
}

function removeElem(){
	$('.stats-body .pill-content .pill-content .pill-pane.active .stat-viewer').contents().remove();
}

function addEvtForRadioBtn(button,mod){
	button.find('button').on('click',function(){
		var title = $(this).attr('title');
		var type = $('div.stats-body>div.pill-view>div.pill-content>div.pill-pane.active').attr('id').split('-')[0];
		var label = $('.pill-view .pill-pane.active .pill-view ul li.active').text();
		removeElem();
		initGraph(label,type,title,mod); 
	});
}

function insertCaption(idTag,caption){
	var captionWrapper = $('<div></div>');
	captionWrapper.addClass('caption-graph');
	captionWrapper.append(caption);
	$('#'+idTag).prepend(captionWrapper);
}

function addEvtForMainPills(mod){
	$('.stats-body ul:first a[data-toggle="pill"]').on('shown', function (e) {
		removeElem();
 		var curr_tab = e.currentTarget.childNodes[0].data.toLowerCase(); // activated tab
 		var type = $('#view-pref button.active').attr('title');
 		var alertedPill = $('.pill-pane.active li.active').text();
	 	initGraph(alertedPill,curr_tab,type,mod);
	});	
}

function correctLabelForYear(id){
	initLabelForYear();
	var html = $(id+' div.morris-hover-row-label').html();
	setInterval(function(){
		var curr =  $(id +' div.morris-hover-row-label').html();  
		if(curr !== undefined && curr !== html && curr.split(' ')[0] !== 'Round'){
				initLabelForYear(id);
				html = $(id + ' div.morris-hover-row-label').html(); 
			} 
	}, 1); 
}

function initLabelForYear(id){
	var rounds = ['1A','1B','1C','2A','2B','2C','3A','3B'];
	var text = $(id+' div.morris-hover-row-label').text();
	var round = rounds[parseInt(text)-1];
	$(id+' div.morris-hover-row-label').text('Round ' + round);
}