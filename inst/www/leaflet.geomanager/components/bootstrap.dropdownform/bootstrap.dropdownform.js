/*!
 * bootstrap-dropdownform.js v0.0.1
 * https://github.com/olegsmith/bootstrap.dropdownform
 * ============================================================
 * Copyright 2013 (c) olegsmith
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0.txt
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdownform]'
    ,toggleDropdown='[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).on('click.dropdownform.data-api', this.toggle)
        $('html').on('click.dropdownform.data-api', function () {
          $el.parent().removeClass('openform');
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('openform')

      clearMenus();
      clearDropdown(e);

      if (!isActive) {
        $parent.toggleClass('openform')
        $this.trigger('openform');
      }

      $this.focus()

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.keyCode)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('openform')

      if (!isActive || (isActive && e.keyCode == 27)) {
        if (e.which == 27) $parent.find(toggle).focus()
        return $this.click()
      }

      $items = $('[role=menu] li:not(.divider):visible a', $parent)

      if (!$items.length) return

      index = $items.index($items.filter(':focus'))

      if (e.keyCode == 38 && index > 0) index--                                        // up
      if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items
        .eq(index)
        .focus()
    }

  }

  function clearMenus() {
    $(toggle).each(function () {
      var parent = getParent($(this));
      if (parent.hasClass('openform')) {
        $(this).trigger('closeform');
      }
      parent.removeClass('openform');
    })
  }

  function clearDropdown(e) {
    $(toggleDropdown).each(function () {
        getParent($(this)).removeClass('open')
    })
  }

  function clearDropdownOutOfForm(e) {
    if ($(e.target).parents('.openform').length==0) {
      clearMenus();
    }
  }

  function cancelForm(e) {
    $(toggle).each(function () {
      var parent = getParent($(this));
      if (parent.hasClass('openform')) {
        $(this).trigger('cancelform');
      }
      parent.removeClass('openform');
    })
  }

  function applyForm(e) {
    $(toggle).each(function () {
      var parent = getParent($(this));
      if (parent.hasClass('openform')) {
        $(this).trigger('applyform');
      }
      parent.removeClass('openform');
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = selector && $(selector)

    if (!$parent || !$parent.length) $parent = $this.parent()

    return $parent
  }


  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  var old = $.fn.dropdown

  $.fn.dropdownform = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('dropdownform')
      if (!data) $this.data('dropdownform', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


 /* DROPDOWN NO CONFLICT
  * ==================== */

  $.fn.dropdownform.noConflict = function () {
    $.fn.dropdownform = old
    return this
  }


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .on('click.dropdownform.data-api', clearDropdownOutOfForm)
    .on('click.dropdownform.data-api', '.cancel', cancelForm)
    .on('click.dropdownform.data-api', '.apply', applyForm)
    .on('click.dropdownform.data-api'  , toggle, Dropdown.prototype.toggle)

}(window.jQuery);