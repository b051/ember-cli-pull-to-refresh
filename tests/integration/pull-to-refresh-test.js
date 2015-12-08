import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../helpers/start-app';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

var App;

function touchEventY(type, y) {
  return new $.Event(type, {
    originalEvent: {
      targetTouches: [{
        pageY: y
      }]
    }
  });
}

moduleForComponent('pull-to-refresh', 'PullToRefresh', {
  integration: true,
  setup(assert) {
    App = startApp();
    this.render(hbs`{{pull-to-refresh refresh='refresh'}}`);

    this.gotRefreshAction = false;
    this.on('refresh', () => {
      this.gotRefreshAction = true;
    });

    this.pullDown = (start, end) => {
      this.$('.pull-to-refresh-child').trigger(touchEventY('touchstart', start));
      this.$('.pull-to-refresh-child').trigger(touchEventY('touchmove', end));
    };

    this.letGo = () => {
      this.$('.pull-to-refresh-child').trigger(touchEventY('touchend', 0));
    };

    this.expectTop = (top) => {
      assert.equal(this.$('.pull-to-refresh-child').attr('style'), `top: ${top}px;`);
    };

    this.expectLoading = (loading) => {
      let method = loading ? 'ok' : 'notOk';
      assert[method](this.$('.pull-to-refresh-parent').hasClass('loading'));
      assert.equal(this.gotRefreshAction, loading, 'refresh action sent');
    };
  },
  teardown() {
    Ember.run(App, 'destroy');
  }
});

test('rendering', function (assert) {
  assert.equal(this.$().length, 1);
  assert.equal(this.$().attr('style'), undefined);
  assert.equal(this.$('.pull-to-refresh-child').length, 1);
});

test('pulling down', function () {
  this.pullDown(80, 90);

  this.expectTop(10);
});

test('letting go', function () {
  this.pullDown(80, 90);

  this.letGo();

  this.expectTop(0);
  this.expectLoading(false);
});

test('snapping back', function () {
  this.pullDown(80, 180);

  this.letGo();

  this.expectTop(0);
  this.expectLoading(true);
});

test('pulling down when loading', function () {
  this.pullDown(80, 130);
  this.letGo();
  this.expectTop(0);
  this.expectLoading(true);

  this.pullDown(80, 200);
  this.expectTop(0);
  this.expectLoading(true);

  this.letGo();
  this.expectLoading(true);
});

test('overpulling', function () {
  this.pullDown(80, 280);
  this.expectTop(180);

  this.letGo();

  this.expectLoading(true);
});
