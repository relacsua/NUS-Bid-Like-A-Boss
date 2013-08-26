# Create your views here.
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from urllib2 import urlopen, URLError
from django.utils import simplejson
from bs4 import BeautifulSoup
from json import load
import os
import time

PROJECT_ROOT = os.path.join(os.path.dirname(__file__),'..')
info = {}
info['apikey'] = 'cCICRaGJ1sru6R9fUZkNC'
info['bidstats'] = ''

def main(request):
    if 'token' not in request.session:
        return HttpResponseRedirect('/welcome/')
    url_profile = 'https://ivle.nus.edu.sg/api/Lapi.svc/Profile_View?APIKey=' + info['apikey'] + '&AuthToken=' + request.session['token']
    profile_resp = urlopen(url_profile)
    profile_obj = load(profile_resp)
    info.update(profile_obj['Results'][0]) 
    return render_to_response('main.html',info)

def welcome(request):
    if info['bidstats'] == '':
        return HttpResponseRedirect('/store/data/')
    return render_to_response('welcome.html',info)


def login(request):
    try:
        request.session['token'] = request.GET['token']
        return HttpResponseRedirect('/')
    except:
        return HttpResponseRedirect('/welcome/')

#returns json file
def moduletaken(request): 
    try:
        start = time.time()
        print 'starting..'
        url_modtaken = 'https://ivle.nus.edu.sg/api/Lapi.svc/Modules_Taken?APIKey=' + info['apikey'] +'&AuthToken=' + request.session['token'] + '&StudentID=' + info['UserID']
        module_taken_resp = urlopen(url_modtaken)
        print 'urlopen method executed',time.time() - start
        module_taken_obj = load(module_taken_resp)
        print 'loaded json into local var',time.time() - start
        print info['Faculty'],time.time() - start
        module_taken_obj['Faculty'] = info['Faculty']
        for mod in module_taken_obj['Results']:
            mod['MC'] = MCCrawler(mod['ModuleCode'],mod['AcadYear'],mod['Semester'])
        print 'populated..',time.time() - start
        return HttpResponse(simplejson.dumps(module_taken_obj),mimetype='application/json')
    except KeyError:
        return HttpResponseRedirect('/welcome/')

def logout(request):
    try:
        del request.session['token']
    except KeyError:
        pass
    return HttpResponseRedirect('/welcome/')

def getBidStats(request):
    mod_name = request.GET['modname']
    data = []
    moduleFound = False
    bid_stats_all = info['bidstats']
    print len(bid_stats_all)
    i = 0
    while i < len(bid_stats_all):
        bidToSend = []
        semester = bid_stats_all[i]['Semester']
        year = bid_stats_all[i]['Year']
        bid = bid_stats_all[i]['Bid']
        j = 0
        while j<len(bid):
            rounds = bid[j]['Round']
            modToSend = {}
            if str(mod_name) in bid[j]['Info']:
                module = bid[j]['Info'][str(mod_name)]
                modToSend[mod_name] = module
                moduleFound = True           
            InfoToSend = {'Round':rounds,'Info':modToSend}
            bidToSend.append(InfoToSend)
            j+=1
        data.append({'Bid':bidToSend,'Semester':semester,'Year':year})
        i+=1
    data = data if moduleFound else []
    return HttpResponse(simplejson.dumps(data),mimetype='application/json')


# Crawler below

def MCCrawler(mod_code,acad_year,sem):
    url = 'http://ivle7.nus.edu.sg/lms/Account/NUSBulletin/msearch_view.aspx?modeCode=%s&acadYear=%s&semester=%s' %(mod_code,acad_year,sem)
    page = urlopen(url)
    soup = BeautifulSoup(page)
    rows = soup.select('table.TableCtrl tr')
    for row in rows:
        if str(row.select('td:nth-of-type(1) font')[0].string) == 'Module Credit':
            return str(row.select('td:nth-of-type(2) font')[0].string)

def storeBidStats(request):
    json_data=open(os.path.join(PROJECT_ROOT,'staticfiles/json/bidding-stats.json'))
    data = load(json_data)
    info['bidstats'] = data
    return HttpResponseRedirect('/welcome/')
