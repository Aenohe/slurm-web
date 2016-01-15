/*
 * Copyright (C) 2015 EDF SA
 *
 * This file is part of slurm-web.
 *
 * slurm-web is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * slurm-web is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with slurm-web.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

define([
  'jquery',
  'handlebars',
  'text!../../js/core/navbar/navbar.hbs',
  'user-utils',
  'boolean-helpers',
  'string-helpers',
  'view-helpers'
], function ($, Handlebars, template, userUtils) {
  template = Handlebars.compile(template);

  var VIEWS = [
    {id: 'jobs', name: 'Jobs'},
    {id: 'racks', name: 'Racks'},
    {id: 'jobsmap', name: 'JobsMap'},
    {
      id: '3dview',
      name: '3D View',
      condition: !(/*@cc_on!@*/false || !!document.documentMode),
    },
    {id: 'partitions', name: 'Partitions'},
    {id: 'qos', name: 'QOS'},
    {id: 'reservations', name: 'Reservations'},
    {id: 'gantt', name: 'Gantt'},
    {id: 'topology', name: 'Topology'}
  ];

  return function (config) {
    var self = this;
    this.userLogged = true;

    $(document).on('logout', function (e) {
      e.preventDefault();

      self.userLogged = false;
      self.destroy();
      self.init();
    });

    $(document).on('logged', function (e) {
      self.userLogged = true;
      self.destroy();
      self.init();
    });

    $(document).on('destroyNavbar', function (e) {
      self.destroy();
    });

    this.init = function () {
      this.availableViews = VIEWS.filter(function(view) {
        var restrictedViews = config.cluster.restrictedViews || [];
        return restrictedViews.indexOf(view.id) === -1;
      });

      var context = {
        clusterName: config.cluster.name + '\'s Slurm HPC Dashboard',
        authEnabled: config.cluster.authentication.enabled,
        views: this.availableViews,
        userLogged: this.userLogged,
        user: $.extend({ username: '' }, userUtils.getUser(config.cluster)),
        notIE: !(/*@cc_on!@*/false || !!document.documentMode)
      };

      $('body').prepend(template(context));

      $("#navbar > ul > li > a[id^='menu-']").on('click', function (e) {
        e.preventDefault();
        $(document).trigger('show', { page: e.target.id.split('-')[1] });
      });

      $('#menu-logout').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        $(document).trigger('logout', { cluster: config.cluster });
      });

      $(document).trigger('navbarLoaded', { height: $('#navbar').height() });

      $('body>.container-fluid').css({'margin-top': $('nav').height()+'px'});
    };

    this.destroy = function () {
      $("#navbar > ul > li > a[id^='menu-']").off('click');
      $('#menu-logout').off('click');
      $('nav:first-child').remove();
    };
  };
});
