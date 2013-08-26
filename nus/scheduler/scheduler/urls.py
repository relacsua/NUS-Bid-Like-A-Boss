from django.conf.urls import patterns, include, url
from app import views
from django.conf import settings 
from django.conf.urls.static import static  
from django.contrib.staticfiles.urls import staticfiles_urlpatterns 


# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
                       (r'^$',views.main),
                       (r'^welcome/$',views.welcome),
                       (r'^login/auth/$',views.login),
                       (r'^module/taken/$',views.moduletaken),
                       (r'^logout/$',views.logout),
                       (r'^store/data/$',views.storeBidStats),
                       (r'^get/data/$',views.getBidStats),
    # Examples:
    # url(r'^$', 'scheduler.views.home', name='home'),
    # url(r'^scheduler/', include('scheduler.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)#  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 

#urlpatterns += staticfiles_urlpatterns()
if settings.DEBUG:
  urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$','django.views.static.serve',{'document_root':settings.MEDIA_ROOT}),
    )