import React from 'react';

import {PureComponent} from '../base-components';
import {decorate, getTabsProps} from '../utils/plugins';

import Tabs_ from './tabs';

const Tabs = decorate(Tabs_, 'Tabs');

export default class Header extends PureComponent {
  constructor() {
    super();
    this.onChangeIntent = this.onChangeIntent.bind(this);
    this.handleHeaderMouseDown = this.handleHeaderMouseDown.bind(this);
    this.handleHamburgerMenuClick = this.handleHamburgerMenuClick.bind(this);
    this.handleMaximizeClick = this.handleMaximizeClick.bind(this);
    this.handleMinimizeClick = this.handleMinimizeClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  onChangeIntent(active) {
    // we ignore clicks if they're a byproduct of a drag
    // motion to move the window
    if (window.screenX !== this.headerMouseDownWindowX || window.screenY !== this.headerMouseDownWindowY) {
      return;
    }

    this.props.onChangeTab(active);
  }

  handleHeaderMouseDown(ev) {
    // the hack of all hacks, this prevents the term
    // iframe from losing focus, for example, when
    // the user drags the nav around
    ev.preventDefault();

    // persist start positions of a potential drag motion
    // to differentiate dragging from clicking
    this.headerMouseDownWindowX = window.screenX;
    this.headerMouseDownWindowY = window.screenY;
  }

  handleHamburgerMenuClick(event) {
    let {right: x, bottom: y} = event.currentTarget.getBoundingClientRect();
    x -= 15; // to compensate padding
    y -= 12; // ^ same
    this.props.openHamburgerMenu({x, y});
  }

  handleMaximizeClick() {
    if (this.props.maximized) {
      this.props.unmaximize();
    } else {
      this.props.maximize();
    }
  }

  handleMinimizeClick() {
    this.props.minimize();
  }

  handleCloseClick() {
    this.props.close();
  }

  componentWillUnmount() {
    delete this.clicks;
    clearTimeout(this.clickTimer);
  }

  getWindowHeaderConfig() {
    const {showHamburgerMenu, showWindowControls} = this.props;

    const defaults = {
      hambMenu: process.platform === 'win32', // show by default on windows
      winCtrls: !this.props.isMac // show by default on windows and linux
    };

    // don't allow the user to change defaults on MacOS
    if (this.props.isMac) {
      return defaults;
    }

    return {
      hambMenu: showHamburgerMenu === '' ? defaults.hambMenu : showHamburgerMenu,
      winCtrls: showWindowControls === '' ? defaults.winCtrls : showWindowControls
    };
  }

  template(css) {
    const {isMac} = this.props;
    const props = getTabsProps(this.props, {
      tabs: this.props.tabs,
      borderColor: this.props.borderColor,
      onClose: this.props.onCloseTab,
      onChange: this.onChangeIntent
    });
    const {borderColor} = props;
    let title = 'Hyper';
    if (props.tabs.length === 1 && props.tabs[0].title) {
      // if there's only one tab we use its title as the window title
      title = props.tabs[0].title;
    }
    const {hambMenu, winCtrls} = this.getWindowHeaderConfig();
    const left = winCtrls === 'left';
    const maxButtonHref = this.props.maximized
      ? './renderer/assets/icons.svg#restore-window'
      : './renderer/assets/icons.svg#maximize-window';

    return (
      <header
        className={css('header', isMac && 'headerRounded')}
        onMouseDown={this.handleHeaderMouseDown}
        onDoubleClick={this.handleMaximizeClick}
      >
        {!isMac && (
          <div className={css('windowHeader', props.tabs.length > 1 && 'windowHeaderWithBorder')} style={{borderColor}}>
            {hambMenu && (
              <svg
                className={css('shape', (left && 'hamburgerMenuRight') || 'hamburgerMenuLeft')}
                onClick={this.handleHamburgerMenuClick}
              >
                <use xlinkHref="./renderer/assets/icons.svg#hamburger-menu" />
              </svg>
            )}
            <span className={css('appTitle')}>{title}</span>
            {winCtrls && (
              <div className={css('windowControls', left && 'windowControlsLeft')}>
                <svg className={css('shape', left && 'minimizeWindowLeft')} onClick={this.handleMinimizeClick}>
                  <use xlinkHref="./renderer/assets/icons.svg#minimize-window" />
                </svg>
                <svg className={css('shape', left && 'maximizeWindowLeft')} onClick={this.handleMaximizeClick}>
                  <use xlinkHref={maxButtonHref} />
                </svg>
                <svg className={css('shape', 'closeWindow', left && 'closeWindowLeft')} onClick={this.handleCloseClick}>
                  <use xlinkHref="./renderer/assets/icons.svg#close-window" />
                </svg>
              </div>
            )}
          </div>
        )}
        {this.props.customChildrenBefore}
        <Tabs {...props} />
        {this.props.customChildren}
      </header>
    );
  }

  styles() {
    return {
      header: {
        position: 'fixed',
        top: '1px',
        left: '1px',
        right: '1px',
        zIndex: '100'
      },

      headerRounded: {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px'
      },

      windowHeader: {
        height: '34px',
        width: '100%',
        position: 'fixed',
        top: '1px',
        left: '1px',
        right: '1px',
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },

      windowHeaderWithBorder: {
        borderColor: '#ccc',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px'
      },

      appTitle: {
        fontSize: '12px'
      },

      shape: {
        width: '40px',
        height: '34px',
        padding: '12px 15px 12px 15px',
        WebkitAppRegion: 'no-drag',
        color: '#FFFFFF',
        opacity: 0.5,
        shapeRendering: 'crispEdges',
        ':hover': {
          opacity: 1
        },
        ':active': {
          opacity: 0.3
        }
      },

      hamburgerMenuLeft: {
        position: 'fixed',
        top: '0',
        left: '0'
      },

      hamburgerMenuRight: {
        position: 'fixed',
        top: '0',
        right: '0'
      },

      windowControls: {
        display: 'flex',
        width: '120px',
        height: '34px',
        justifyContent: 'space-between',
        position: 'fixed',
        right: '0'
      },

      windowControlsLeft: {left: '0px'},

      closeWindowLeft: {order: 1},

      minimizeWindowLeft: {order: 2},

      maximizeWindowLeft: {order: 3},

      closeWindow: {':hover': {color: '#FE354E'}, ':active': {color: '#FE354E'}}
    };
  }
}
