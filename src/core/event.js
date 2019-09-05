/**
 * Copyright(c) 2019, prprprus All rights reserved.
 * Use of this source code is governed by a BSD - style.
 * license that can be found in the LICENSE file.
 */

/**
 * Class Event refers to the event that needs to be captured,
 * caused by user behavior (such as clicks, new tabs, etc.)
 */
class Event {
  /**
   * Create an Event object.
   * 
   * @param {string} type - Type of event.
   */
  constructor(type) {
    this.type = type
  }
}

const click = new Event('click');
const clickTargetBlank = new Event('popup');
const newTab = new Event('targetcreated');
const closeTab = new Event('targetdestroyed');
const URLChange = new Event('targetchanged');
const input = new Event('blur');
const scroll = new Event('scroll');

module.exports = {
  click,
  clickTargetBlank,
  newTab,
  closeTab,
  URLChange,
  input,
  scroll,
}
