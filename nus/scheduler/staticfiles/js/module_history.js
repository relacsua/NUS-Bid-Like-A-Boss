// Info stored is used for module search
var userProfile;

var department ={
	'arts': 'ARTS & SOCIAL SCIENCES',
	'social science': 'ARTS & SOCIAL SCIENCES',
	'dentistry': 'DENTISTRY',
	'engineering': 'ENGINEERING',
	'multi disciplinary': 'JOINT MULTI-DISCIPLINARY PROGRAMMES',
	'law': 'LAW',
	'non faculty': 'NON-FACULTY-BASED DEPARTMENTS',
	'public health': 'SAW SWEE HOCK SCHOOL OF PUBLIC HEALTH',
	'computing' : 'SCHOOL OF COMPUTING',
	'design': 'SCHOOL OF DESIGN AND ENVIRONMENT',
	'science': 'SCIENCE',
	'scholar': 'UNIVERSITY SCHOLARS PROGRAMME',
	'yale': 'YALE-NUS COLLEGE',
	'medicine': 'YONG LOO LIN SCHOOL OF MEDICINE',
	'music': 'YONG SIEW TOH CONSERVATORY OF MUSIC',
	'business': 'SCHOOL OF BUSINESS'
};

function getFacultyOfUser(fac){
	var user_fac = fac.toLowerCase();
	for(key in department){
		if(user_fac.indexOf(key) >= 0){
			user_fac = department[key];
			break;
		}
	}
	return user_fac;
}

function processData(data){
	var gem = /GE[A-Z]{1}\d{4}[A-Z]?/;
	var ss = /SS[A-Z]{1}\d{4}[A-Z]?/;
	var thousand = /[A-Z]{2,3}1\d{3}[A-Z]?/;
	var thousand_level_module = 0;
	var totalMC = 0;
	var gemMC = 0;
	var ssMC = 0;
	for(var i=0;i<data.length;i++){
		var mod_code = data[i].ModuleCode;
		var mc =  parseInt(data[i].MC);
		if(!isNaN(mc)) { //special case mc = '-'
			if(mod_code.search(thousand) != -1)
				thousand_level_module += mc;
			if(mod_code.search(gem) != -1)
				gemMC += mc;
			else if(mod_code.search(ss) != -1)
				ssMC += mc;
			totalMC += mc;
		}else if(mod_code === 'GXK1999'){ // including  apc modules of poly students
			totalMC += 4;
			gemMC += 4;
		}else if(mod_code === 'POY1901' || mod_code === 'POY1902' || mod_code === 'POY1903' || mod_code === 'POY1904'){
			totalMC += 4;
		}
	}

	return {'gem': gemMC, 'ssm': ssMC, 'thousand': thousand_level_module, 'mc' : totalMC};
}

function displayUserModStat(profile){
	// var stats hold the name of the classes as keys and the required MCs and MCs completed as value
	var stats = {
		'.gem' : [profile.Gem,8],
		'.ss' : [profile.Ssm,4],
		'.thousand-lvl' : [profile.Thousand,60],
		'.deg-completion' : [profile.Total,160]
	};

	var wrapper = $('div.user-mod-stat.span6');

	for(key in stats){
		var req_mc = parseInt(stats[key][1]);
		var com_mc = parseInt(stats[key][0]);
		var width = Math.floor(com_mc/req_mc*100);
		wrapper.find('div'+ key +' div.stat-bar div.bar').animate({width:width+'%'},1000,'linear');
		if(width>=100) wrapper.find('div'+ key +' div.stat-bar').removeClass('active'); 
		wrapper.find('div' + key +' span#info').text(com_mc + ' MC(s) out of ' + req_mc + 'MC(s) completed');
	}

}

$(function(){ 
	
	$('#loading-msg').modal({
		backdrop: 'static',
		keyboard: false
	});

	var Modules = [];
	var Year = 0;
	$.getJSON('/module/taken',function(data,jqxhr){	
		var i = data.Results.length-1;
		var j = 0; //For adding of list in carousel
		while(i >= 0){
			// Forming the table
			var tb = $('<table></table>');
			tb.addClass('table');
			tb.addClass('table-hover');
			tb.addClass('table-bordered');
			if(i===0 || curr_acadYear !== data.Results[i].AcadYear)
				Year++;
			var curr_acadYear = data.Results[i].AcadYear;
			var curr_semester = data.Results[i].Semester;
			tb.append('<thead></thead>');
			tb.append('<tbody></tbody>');
			tb.find('thead:last').append('<tr><th colspan = '+2+'>' + curr_acadYear + ' ' + data.Results[i].SemesterDisplay + '</th></tr>');
			tb.find('thead:last').append('<tr><th>Module Code</th><th>Module Title</th></tr>');
			// Forming the list item for carousel
			var list = $('<li></li>');
			list.attr({
				'data-target': '#myCarousel',
				'data-slide-to': j
			});
			if(j==0)
				list.addClass('active');
			$('ol.carousel-indicators').append(list);
			while((data.Results[i].AcadYear === curr_acadYear) && (data.Results[i].Semester === curr_semester)){
				// Populating the table with the data from IVLE API
				tb.find('tbody:last').append('<tr><td>' + data.Results[i].ModuleCode + '</td><td>' + data.Results[i].ModuleTitle + '</td></tr>');
				Modules.push(data.Results[i].ModuleCode);
				i--;
				if(i < 0) break;
			}
			var listItem = $('<div></div>');
			listItem.addClass('item');
			$(listItem).append(tb);
			$('div.carousel-inner').append(listItem);
			j++;
		}

		$('div.carousel-inner div.item:first').addClass('active');	

		//removing loading msg
		$('#loading-msg').modal('hide');
		$('#loading-msg').remove();
		// showing the info
		if(j > 1){
			$('a.carousel-control').css('display','block');
			$('div.module-viewer h3').css('display','block');
		}
		$('div.user-mod-stat').css('display','block');
		$('.carousel').carousel({interval: 3000});
    	$('.carousel').carousel('cycle');

		//Storing INFO for module search
		var mc_data = processData(data.Results);
		userProfile = {
			Year: Year,
			Modules: Modules,
			Faculty: getFacultyOfUser(data['Faculty']),
			Gem : mc_data['gem'],
			Ssm : mc_data['ssm'],
			Thousand : mc_data['thousand'],
			Total: mc_data['mc']
		};
		displayUserModStat(userProfile);
	});
});