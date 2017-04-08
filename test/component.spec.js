describe("Component", function () {

    var ColorPicker = san.defineComponent({
        template: '<div><b title="{{value}}">{{value}}</b>'
            + '<ul class="ui-colorpicker">'
            +    '<li '
            +        'san-for="item in datasource" '
            +        'style="background: {{item}}" '
            +        'class="{{item == value ? \'selected\' : \'\'}}" '
            +        'on-click="itemClick(item)"'
            +    '></li>'
            + '</ul></div>',

        initData: {
            datasource: [
                'red', 'blue', 'yellow', 'green'
            ]
        },

        itemClick: function (item) {
            this.data.set('value', item);
        }
    });

    var Label = san.defineComponent({
        template: '<span title="{{text}}">{{text}}</span>'
    });

    it("life cycle", function () {
        var isInited = false;
        var isCreated = false;
        var isAttached = false;
        var isDetached = false;
        var isDisposed = false;

        var MyComponent = san.defineComponent({
            components: {
                'ui-color': ColorPicker
            },
            template: '<span title="{{color}}">{{color}}</span>',

            inited: function () {
                isInited = true;
            },

            created: function () {
                isCreated = true;
            },

            attached: function () {
                isAttached = true;
            },

            detached: function () {
                isDetached = true;
            },

            disposed: function () {
                isDisposed = true;
            }
        });
        var myComponent = new MyComponent();
        expect(myComponent.lifeCycle.is('inited')).toBe(true);
        expect(myComponent.lifeCycle.is('created')).toBe(false);
        expect(myComponent.lifeCycle.is('attached')).toBe(false);
        expect(isInited).toBe(true);
        expect(isCreated).toBe(false);
        expect(isAttached).toBe(false);

        myComponent.data.set('color', 'green');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);
        expect(myComponent.lifeCycle.is('inited')).toBe(true);
        expect(myComponent.lifeCycle.is('created')).toBe(true);
        expect(myComponent.lifeCycle.is('attached')).toBe(true);
        expect(isInited).toBe(true);
        expect(isCreated).toBe(true);
        expect(isAttached).toBe(true);

        myComponent.detach();
        expect(myComponent.lifeCycle.is('created')).toBe(true);
        expect(myComponent.lifeCycle.is('attached')).toBe(false);
        expect(myComponent.lifeCycle.is('detached')).toBe(true);
        expect(isDetached).toBe(true);

        myComponent.attach(wrap);
        expect(myComponent.lifeCycle.is('created')).toBe(true);
        expect(myComponent.lifeCycle.is('attached')).toBe(true);
        expect(myComponent.lifeCycle.is('detached')).toBe(false);


        myComponent.dispose();
        expect(myComponent.lifeCycle.is('inited')).toBe(false);
        expect(myComponent.lifeCycle.is('created')).toBe(false);
        expect(myComponent.lifeCycle.is('attached')).toBe(false);
        expect(myComponent.lifeCycle.is('detached')).toBe(false);
        expect(myComponent.lifeCycle.is('disposed')).toBe(true);
        expect(isDisposed).toBe(true);

        document.body.removeChild(wrap);
    });

    it("life cycle updated", function (done) {
        var times = 0;

        var MyComponent = san.defineComponent({
            template: '<a><span title="{{email}}">{{name}}</span></a>',

            updated: function () {
                times++;
            }
        });
        var myComponent = new MyComponent();
        myComponent.data.set('email', 'errorrik@gmail.com');
        myComponent.data.set('name', 'errorrik');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        expect(times).toBe(0);

        myComponent.data.set('email', 'erik168@163.com');
        myComponent.data.set('name', 'erik');
        expect(times).toBe(0);

        san.nextTick(function () {
            expect(times).toBe(1);

            var span = wrap.getElementsByTagName('span')[0];
            expect(span.innerHTML.indexOf('erik')).toBe(0);
            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })

    });

    it("template as static property", function () {
        var MyComponent = san.defineComponent({});
        MyComponent.template = '<span title="{{color}}">{{color}}</span>';
        var myComponent = new MyComponent({data: {color: 'red'}});

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('red');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("filters as static property", function () {
        var MyComponent = san.defineComponent({});

        MyComponent.template = '<span title="{{color|up}}">{{color|up}}</span>';
        MyComponent.filters = {
            up: function (source) {
                return source.toUpperCase();
            }
        };
        var myComponent = new MyComponent({data: {color: 'red'}});

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('RED');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("components as static property", function () {
        var MyComponent = san.defineComponent({});

        MyComponent.template = '<div><ui-label text="erik"></ui-label>';
        MyComponent.components = {
            'ui-label': {
                template: '<span title="{{text}}">{{text}}</span>'
            }
        };
        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('erik');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("initData", function (done) {
        var MyComponent = san.defineComponent({
            template: '<a><span title="{{email}}">{{name}}</span></a>',

            initData: function () {
                return {
                    email: 'errorrik@gmail.com',
                    name: 'errorrik'
                }
            }
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);


        myComponent.data.set('email', 'erik168@163.com');
        myComponent.data.set('name', 'erik');

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.innerHTML.indexOf('errorrik')).toBe(0);
        expect(span.title.indexOf('errorrik@gmail.com')).toBe(0);

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.innerHTML.indexOf('erik')).toBe(0);
            expect(span.title.indexOf('erik168@163.com')).toBe(0);

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })

    });



    it("custom event should not pass DOM Event object, when fire with no arg", function (done) {
        var Label = san.defineComponent({
            template: '<a><span on-click="clicker" id="component-custom-event1" style="cursor:pointer">click here to fire change event with no arg</span></a>',

            clicker: function () {
                this.fire('change');
            }
        });

        var changed = false;

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div><ui-label on-change="labelChange($event)"></ui-label></div>',

            labelChange: function (event) {
                expect(event).toBeUndefined();
                changed = true;
            }
        });


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        function doneSpec() {
            if (changed) {
                done();
                myComponent.dispose();
                document.body.removeChild(wrap);
                return;
            }

            setTimeout(doneSpec, 500);
        }

        triggerEvent('#component-custom-event1', 'click');

        doneSpec();
    });

    it("custom event should not pass DOM Event object, when fire with equal-false value, like 0", function (done) {
        var Label = san.defineComponent({
            template: '<a><span on-click="clicker" id="component-custom-event2" style="cursor:pointer">click here to fire change event with arg 0</span></a>',

            clicker: function () {
                this.fire('change', 0);
            }
        });

        var changed = false;

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div><ui-label on-change="labelChange($event)"></ui-label></div>',

            labelChange: function (event) {
                expect(event).toBe(0);
                changed = true;
            }
        });


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        function doneSpec() {
            if (changed) {
                done();
                myComponent.dispose();
                document.body.removeChild(wrap);
                return;
            }

            setTimeout(doneSpec, 500);
        }

        triggerEvent('#component-custom-event2', 'click');

        doneSpec();
    });

    it("data binding can use filter interp", function () {
        var Label = san.defineComponent({
            template: '<a><span title="{{text}}">{{text}}</span></a>',

            updated: function () {
                subTimes++;
            }
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div><ui-label text="{{name|upper}}"></ui-label></div>',

            initData: function () {
                return {name: 'erik'};
            },

            filters: {
                upper: function (text) {
                    return text.toUpperCase();
                }
            }
        });

        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('ERIK');

        myComponent.dispose();
        document.body.removeChild(wrap);

    });

    it("life cycle updated, nested component", function (done) {
        var times = 0;
        var subTimes = 0;

        var Label = san.defineComponent({
            template: '<a><span title="{{title}}">{{text}}</span></a>',

            updated: function () {
                subTimes++;
            }
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div><h5><ui-label title="{{name}}" text="{{jokeName}}"></ui-label></h5>'
                + '<p><a>{{school}}</a><u>{{company}}</u></p></div>',

            updated: function () {
                times++;
            }
        });

        var myComponent = new MyComponent();
        myComponent.data.set('jokeName', 'airike');
        myComponent.data.set('name', 'errorrik');
        myComponent.data.set('school', 'none');
        myComponent.data.set('company', 'bidu');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        expect(times).toBe(0);
        expect(subTimes).toBe(0);

        myComponent.data.set('name', 'erik');
        myComponent.data.set('jokeName', '2b');
        expect(times).toBe(0);
        expect(subTimes).toBe(0);

        san.nextTick(function () {

            var span = wrap.getElementsByTagName('span')[0];
            expect(span.innerHTML.indexOf('2b')).toBe(0);
            expect(times).toBe(1);
            expect(subTimes).toBe(1);


            myComponent.data.set('school', 'hainan mid');
            myComponent.data.set('company', 'baidu');

            san.nextTick(function () {
                expect(times).toBe(2);
                expect(subTimes).toBe(1);

                myComponent.dispose();
                document.body.removeChild(wrap);
                done();
            });
        });

    });

    it("dispatch should pass message up, util the first component which recieve it", function (done) {
        var Select = san.defineComponent({
            template: '<ul><slot></slot></ul>',

            messages: {
                'UI:select-item-selected': function (arg) {
                    var value = arg.value;
                    this.data.set('value', value);

                    var len = this.items.length;
                    while (len--) {
                        this.items[len].data.set('selectValue', value);
                    }
                },

                'UI:select-item-attached': function (arg) {
                    this.items.push(arg.target);
                    arg.target.data.set('selectValue', this.data.get('value'));
                },

                'UI:select-item-detached': function (arg) {
                    var len = this.items.length;
                    while (len--) {
                        if (this.items[len] === arg.target) {
                            this.items.splice(len, 1);
                        }
                    }
                }
            },

            inited: function () {
                this.items = [];
            }
        });

        var selectValue;
        var itemId;
        var SelectItem = san.defineComponent({
            template: '<li on-click="select" style="{{value === selectValue ? \'border: 1px solid red\' : \'\'}}"><slot></slot></li>',

            select: function () {
                var value = this.data.get('value');
                this.dispatch('UI:select-item-selected', value);
                selectValue = value;
            },

            attached: function () {
                itemId = this.id;
                this.dispatch('UI:select-item-attached');
            },

            detached: function () {
                this.dispatch('UI:select-item-detached');
            }
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-select': Select,
                'ui-selectitem': SelectItem
            },

            template: '<div><ui-select value="{=v=}">'
                + '<ui-selectitem value="1">one</ui-selectitem>'
                + '<ui-selectitem value="2">two</ui-selectitem>'
                + '<ui-selectitem value="3">three</ui-selectitem>'
                + '</ui-select>please click to select a item<b title="{{v}}">{{v}}</b></div>',

            messages: {
                'UI:select-item-selected': function () {
                    expect(false).toBeTruthy();
                },

                'UI:select-item-attached': function () {
                    expect(false).toBeTruthy();
                },

                'UI:select-item-detached': function () {
                    expect(false).toBeTruthy();
                }
            },
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        function detectDone() {
            if (selectValue) {
                expect(wrap.getElementsByTagName('b')[0].title).toBe(selectValue);

                myComponent.dispose();
                document.body.removeChild(wrap);
                done();
                return;
            }

            setTimeout(detectDone, 500);
        }

        detectDone();
        triggerEvent('#' + itemId, 'click');

    });

    it("outer bind declaration should not set main element property", function (done) {
        var times = 0;
        var subTimes = 0;

        var Label = san.defineComponent({
            template: '<b><span title="{{title}}">{{text}}</span></b>'
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div><h5><ui-label title="{{name}}" text="{{jokeName}}"></ui-label></h5>'
                + '<p><a>{{school}}</a><u>{{company}}</u></p></div>'
        });

        var myComponent = new MyComponent();
        myComponent.data.set('jokeName', 'airike');
        myComponent.data.set('name', 'errorrik');
        myComponent.data.set('school', 'none');
        myComponent.data.set('company', 'bidu');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var b = wrap.getElementsByTagName('b')[0];
        expect(b.getAttribute('title')).toBeNull();

        myComponent.data.set('name', 'erik');
        myComponent.data.set('jokeName', '2b');

        san.nextTick(function () {
            var b = wrap.getElementsByTagName('b')[0];
            expect(b.title).toBe('');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("outer bind declaration can use same name as main element property", function (done) {
        var times = 0;
        var subTimes = 0;

        var Label = san.defineComponent({
            template: '<b title="{{title}}"><span title="{{title}}">{{text}}</span></b>'
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div><h5><ui-label title="{{name}}" text="{{jokeName}}"></ui-label></h5>'
                + '<p><a>{{school}}</a><u>{{company}}</u></p></div>'
        });

        var myComponent = new MyComponent();
        myComponent.data.set('jokeName', 'airike');
        myComponent.data.set('name', 'errorrik');
        myComponent.data.set('school', 'none');
        myComponent.data.set('company', 'bidu');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var b = wrap.getElementsByTagName('b')[0];
        expect(b.getAttribute('title')).toBe('errorrik');

        myComponent.data.set('name', 'erik');
        myComponent.data.set('jokeName', '2b');

        san.nextTick(function () {
            var b = wrap.getElementsByTagName('b')[0];
            expect(b.title).toBe('erik');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("given raw 'self' components config, use itself", function () {
        var MyComponent = san.defineComponent({
            components: {
                'ui-self': 'self'
            },

            initData: function () {
                return {level: 1}
            },

            template: '<u><ui-self level="{{level - 1}}" san-if="level > 0"></ui-self></u>'
        });

        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var us = wrap.getElementsByTagName('u');
        expect(us.length).toBe(2);

        myComponent.dispose();
        document.body.removeChild(wrap);

    });

    it("given raw object to components config, auto use it to define component", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-label': {
                    template: '<a><span title="{{title}}">{{text}}</span></a>'
                }
            },

            template: '<div><h5><ui-label title="{{name}}" text="{{jokeName}}"></ui-label></h5>'
                + '<p><a>{{school}}</a><u>{{company}}</u></p></div>'
        });

        var myComponent = new MyComponent();
        myComponent.data.set('jokeName', 'airike');
        myComponent.data.set('name', 'errorrik');
        myComponent.data.set('school', 'none');
        myComponent.data.set('company', 'bidu');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('errorrik');
            expect(span.innerHTML.indexOf('airike')).toBe(0);

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("template tag in template", function (done) {
        var Label = san.defineComponent({
            template: '<template class="ui-label" title="{{text}}">{{text}}</template>'
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },
            template: '<div><ui-label text="{{name}}"></ui-label></div>'
        });


        var myComponent = new MyComponent();
        myComponent.data.set('name', 'erik');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var labelEl = wrap.firstChild.firstChild;
        expect(labelEl.className).toBe('ui-label');
        expect(labelEl.title).toBe('erik');

        myComponent.data.set('name', 'ci');

        san.nextTick(function () {
            expect(labelEl.className).toBe('ui-label');
            expect(labelEl.title).toBe('ci');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("bind data update property-grained", function (done) {
        var UserInfo = san.defineComponent({
            template: '<u class="ui-label" title="{{info.name}}-{{info.email}}">{{info.name}}-{{info.email}}</u>',

            attached: function () {
                this.watch('info.name', function () {
                    expect(true).toBeTruthy();
                });
                this.watch('info.email', function () {
                    expect(false).toBeTruthy();
                });
            }
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-user': UserInfo
            },
            template: '<div><ui-user info="{{md.user}}"></ui-user></div>'
        });


        var myComponent = new MyComponent({
            data: {
                md: {
                    user: {
                        name: 'erik',
                        email: 'errorrik@gmail.com'
                    }
                }
            }
        });

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('erik-errorrik@gmail.com');

        myComponent.data.set('md.user.name', 'errorrik');

        san.nextTick(function () {
            var u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('errorrik-errorrik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("computed", function (done) {
        var MyComponent = san.defineComponent({
            template: '<div><span title="{{name}}">{{name}}</span></div>',

            initData: function () {
                return {
                    'first': 'first',
                    'last': 'last'
                }
            },

            computed: {
                name: function () {
                    return this.data.get('first') + ' ' + this.data.get('last');
                }
            }
        });


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last');

        myComponent.data.set('last', 'xxx')

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first xxx');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("computed has computed dependency, computed item change", function (done) {
        var MyComponent = san.defineComponent({
            template: '<div><span title="{{msg}}">{{msg}}</span></div>',

            initData: function () {
                return {
                    first: 'first',
                    last: 'last',
                    email: 'name@name.com'
                }
            },

            computed: {
                msg: function () {
                    return this.data.get('name') + '(' + this.data.get('email') + ')'
                },

                name: function () {
                    return this.data.get('first') + ' ' + this.data.get('last');
                }
            }
        });


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last(name@name.com)');

        myComponent.data.set('last', 'xxx')

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first xxx(name@name.com)');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("computed has computed dependency, normal data change", function (done) {
        var MyComponent = san.defineComponent({
            template: '<div><span title="{{msg}}">{{msg}}</span></div>',

            initData: function () {
                return {
                    first: 'first',
                    last: 'last',
                    email: 'name@name.com'
                }
            },

            computed: {
                msg: function () {
                    return this.data.get('name') + '(' + this.data.get('email') + ')'
                },

                name: function () {
                    return this.data.get('first') + ' ' + this.data.get('last');
                }
            }
        });


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last(name@name.com)');

        myComponent.data.set('email', 'san@san.com')

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first last(san@san.com)');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("custom event listen and fire", function () {
        var receive;

        var Label = san.defineComponent({
            template: '<template class="ui-label" title="{{text}}">{{text}}</template>',

            attached: function () {
                this.fire('haha', this.data.get('text') + 'haha');
            }
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div><ui-label text="{{name}}" on-haha="labelHaha($event)"></ui-label></div>',

            labelHaha: function (e) {
                receive = e;
            }
        });


        var myComponent = new MyComponent();
        myComponent.data.set('name', 'erik');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var labelEl = wrap.firstChild.firstChild;
        expect(labelEl.className).toBe('ui-label');
        expect(labelEl.title).toBe('erik');
        expect(receive).toBe('erikhaha');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("ref", function () {
        var MyComponent = san.defineComponent({
            components: {
                'ui-color': ColorPicker
            },
            template: '<div><span title="{{color}}">{{color}}</span> <ui-color value="{= color =}" san-ref="colorPicker"></ui-color></div>'
        });
        var myComponent = new MyComponent();
        myComponent.data.set('color', 'green');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.firstChild.firstChild;
        expect(myComponent.ref('colorPicker') instanceof ColorPicker).toBe(true);
        expect(wrap.getElementsByTagName('b')[0].title).toBe('green');


        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("dynamic ref", function () {
        var MyComponent = san.defineComponent({
            components: {
                'ui-color': ColorPicker
            },
            template: '<div><span title="{{color}}">{{color}}</span> <ui-color value="{=color=}" san-ref="{{name}}"></ui-color></div>'
        });
        var myComponent = new MyComponent();
        myComponent.data.set('color', 'green');
        myComponent.data.set('name', 'c');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.firstChild.firstChild;
        expect(myComponent.ref('c') instanceof ColorPicker).toBe(true);
        expect(wrap.getElementsByTagName('b')[0].title).toBe('green');


        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("dynamic ref in for", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-color': ColorPicker
            },
            initData: function () {
                return {
                    colors: ['blue', 'green']
                };
            },
            template: '<div><p san-for="color, index in colors"><ui-color value="{=color=}" san-ref="color-{{index}}"></ui-color></p></div>'
        });
        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var color0 = myComponent.ref('color-0');
        expect(color0 instanceof ColorPicker).toBe(true);
        expect(color0.data.get('value')).toBe('blue');

        myComponent.data.set('colors', ['red', 'yellow']);

        san.nextTick(function () {
            var color0 = myComponent.ref('color-0');
            var color1 = myComponent.ref('color-1');

            expect(color0 instanceof ColorPicker).toBe(true);
            expect(color0.data.get('value')).toBe('red');
            expect(color1 instanceof ColorPicker).toBe(true);
            expect(color1.data.get('value')).toBe('yellow');


            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });

    it("dynamic ref in for directly", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-color': ColorPicker
            },
            initData: function () {
                return {
                    colors: ['blue', 'green']
                };
            },
            template: '<div><ui-color san-for="color, index in colors" value="{=color=}" san-ref="color-{{index}}"></ui-color></div>'
        });
        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var color0 = myComponent.ref('color-0');
        expect(color0 instanceof ColorPicker).toBe(true);
        expect(color0.data.get('value')).toBe('blue');

        myComponent.data.set('colors', ['red', 'yellow']);

        san.nextTick(function () {
            var color0 = myComponent.ref('color-0');
            var color1 = myComponent.ref('color-1');

            expect(color0 instanceof ColorPicker).toBe(true);
            expect(color0.data.get('value')).toBe('red');
            expect(color1 instanceof ColorPicker).toBe(true);
            expect(color1.data.get('value')).toBe('yellow');


            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });

    it("dynamic ref in if", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-color': ColorPicker
            },
            initData: function () {
                return {
                    name: 'test',
                    color: 'green'
                };
            },
            template: '<div><div san-if="condition"><ui-color value="{=color=}" san-ref="color-{{name}}"></ui-color></div></div>'
        });
        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var color0 = myComponent.ref('color-test');
        expect(color0 == null).toBeTruthy();

        myComponent.data.set('condition', 1);

        san.nextTick(function () {
            var color0 = myComponent.ref('color-test');

            expect(color0 instanceof ColorPicker).toBe(true);
            expect(color0.data.get('value')).toBe('green');


            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });

    it("dynamic ref in if directly", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-color': ColorPicker
            },
            initData: function () {
                return {
                    name: 'test',
                    color: 'green'
                };
            },
            template: '<div><ui-color value="{=color=}" san-if="condition" san-ref="color-{{name}}"></ui-color></div>'
        });
        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var color0 = myComponent.ref('color-test');
        expect(color0 == null).toBeTruthy();

        myComponent.data.set('condition', 1);

        san.nextTick(function () {
            var color0 = myComponent.ref('color-test');

            expect(color0 instanceof ColorPicker).toBe(true);
            expect(color0.data.get('value')).toBe('green');


            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });


    it("update prop", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },
            template: '<a><ui-label text="{{name}}"></ui-label></a>'
        });


        var myComponent = new MyComponent();
        myComponent.data.set('name', 'erik');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('erik');

        myComponent.data.set('name', 'ci');

        san.nextTick(function () {
            expect(span.title).toBe('ci');
            done();
            myComponent.dispose();
            document.body.removeChild(wrap);
        });
    });

    it("update prop from self attached", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },
            template: '<a><ui-label text="{{name}}"></ui-label></a>',

            attached: function () {
                this.data.set('name', 'ci');
            }
        });


        var myComponent = new MyComponent();
        myComponent.data.set('name', 'erik');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('erik');

        san.nextTick(function () {
            expect(span.title).toBe('ci');
            done();
            myComponent.dispose();
            document.body.removeChild(wrap);
        });
    });

    var TelList = san.defineComponent({
        template: '<ul><li san-for="item in list" title="{{item}}">{{item}}</li></ul>'
    });

    var PersonList = san.defineComponent({
        components: {
            'ui-tel': TelList
        },
        template: '<div><dl san-for="item in list"><dt title="{{item.name}}">{{item.name}}</dt><dd><ui-tel list="{{item.tels}}"></ui-tel></dd></dl></div>'
    });

    it("nested", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-person': PersonList
            },
            template: '<div><ui-person list="{{persons}}"></ui-person></div>'
        });
        var myComponent = new MyComponent();
        myComponent.data.set('persons', [
            {
                name: 'erik',
                tels: [
                    '12345678',
                    '123456789',
                ]
            },
            {
                name: 'firede',
                tels: [
                    '2345678',
                    '23456789',
                ]
            }
        ]);

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);
        var dts = wrap.getElementsByTagName('dt');
        expect(dts[0].title).toBe('erik');
        expect(dts[1].title).toBe('firede');

        var dds = wrap.getElementsByTagName('dd');
        var p1lis = dds[1].getElementsByTagName('li');
        expect(p1lis[0].title).toBe('2345678');
        expect(p1lis[1].title).toBe('23456789');

        myComponent.data.set('persons[1].name', 'leeight');
        myComponent.data.set('persons[1].tels', ['12121212', '16161616', '18181818']);


        san.nextTick(function () {
            var dts = wrap.getElementsByTagName('dt');
            expect(dts[0].title).toBe('erik');
            expect(dts[1].title).toBe('leeight');

            var dds = wrap.getElementsByTagName('dd');
            var p1lis = dds[1].getElementsByTagName('li');
            expect(p1lis[0].title).toBe('12121212');
            expect(p1lis[1].title).toBe('16161616');
            expect(p1lis[2].title).toBe('18181818');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("in for", function (done) {
        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },
            template: '<ul><li san-for="p in persons"><b title="{{p.name}}">{{p.name}}</b><h5 san-for="t in p.tels"><ui-label text="{{t}}"></ui-label></h5></li></ul>'
        });
        var myComponent = new MyComponent();
        myComponent.data.set('persons', [
            {
                name: 'erik',
                tels: [
                    '12345678',
                    '123456789',
                ]
            },
            {
                name: 'firede',
                tels: [
                    '2345678',
                    '23456789',
                ]
            }
        ]);

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);
        var lis = wrap.getElementsByTagName('li');
        expect(lis[0].getElementsByTagName('b')[0].title).toBe('erik');
        expect(lis[1].getElementsByTagName('b')[0].title).toBe('firede');

        var p1tels = lis[1].getElementsByTagName('span');
        expect(p1tels[0].title).toBe('2345678');
        expect(p1tels[1].title).toBe('23456789');

        myComponent.data.set('persons[1].name', 'leeight');
        myComponent.data.set('persons[1].tels', ['12121212', '16161616', '18181818']);


        san.nextTick(function () {
            var lis = wrap.getElementsByTagName('li');
            expect(lis[0].getElementsByTagName('b')[0].title).toBe('erik');
            expect(lis[1].getElementsByTagName('b')[0].title).toBe('leeight');

            var p1tels = lis[1].getElementsByTagName('span');
            expect(p1tels[0].title).toBe('12121212');
            expect(p1tels[1].title).toBe('16161616');
            expect(p1tels[2].title).toBe('18181818');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("inner el event and outer custom event", function (done) {
        var innerClicked;
        var outerReceive;

        var Label = san.defineComponent({
            template: '<template class="ui-label" on-click="clicker" style="cursor:pointer;text-decoration:underline">here</template>',

            clicker: function () {
                innerClicked = true;
                this.fire('haha', 1);
            }
        });

        var MyComponent = san.defineComponent({
            components: {
                'ui-label': Label
            },

            template: '<div>Click <ui-label on-haha="labelHaha($event)"></ui-label></div>',

            labelHaha: function (e) {
                outerReceive = e;
            }
        });


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        function detect() {
            if (innerClicked || outerReceive) {
                expect(innerClicked).toBe(true);
                expect(outerReceive).toBe(1);

                myComponent.dispose();
                document.body.removeChild(wrap);
                done();
                return;
            }

            setTimeout(detect, 500);
        }

        triggerEvent('#' + myComponent.childs[1].id, 'click');

        detect();
    });

    it("watch simple data item", function (done) {
        var MyComponent = san.defineComponent({
            template: '<a><span title="{{email}}">{{name}}</span></a>'
        });
        var myComponent = new MyComponent();
        myComponent.data.set('email', 'errorrik@gmail.com');
        myComponent.data.set('name', 'errorrik');

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var watchTriggerTimes = 0;
        myComponent.watch('email', function (value) {
            expect(value).toBe('erik168@163.com');
            expect(this.data.get('email')).toBe(value);
            watchTriggerTimes++;
        });

        myComponent.data.set('email', 'erik168@163.com');
        myComponent.data.set('name', 'erik');
        expect(watchTriggerTimes).toBe(1);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('errorrik@gmail.com');

        san.nextTick(function () {
            expect(watchTriggerTimes).toBe(1);

            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('erik168@163.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })

    });

    it("watch property accessor", function (done) {
        var MyComponent = san.defineComponent({
            template: '<a><span title="{{projects[0].author.email}}">{{projects[0].author.email}}</span></a>',

            initData: function () {
                return {
                    projects: [
                        {
                            name: 'etpl',
                            author: {
                                email: 'errorrik@gmail.com',
                                name: 'errorrik'
                            }
                        }
                    ]

                };
            }
        });
        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var watchTriggerTimes = 0;
        myComponent.watch('projects[0].author', function (value) {
            expect(value.email).toBe('erik168@163.com');
            expect(this.data.get('projects[0].author.email')).toBe(value.email);
            watchTriggerTimes++;
        });

        var emailTriggerTimes = 0;
        myComponent.watch('projects[0].author.email', function (value) {
            expect(value).toBe('erik168@163.com');
            expect(this.data.get('projects[0].author.email')).toBe(value);
            emailTriggerTimes++;
        });

        myComponent.data.set('projects[0].author.email', 'erik168@163.com');
        myComponent.data.set('projects[0].author.name', 'erik');
        expect(watchTriggerTimes).toBe(2);
        expect(emailTriggerTimes).toBe(1);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('errorrik@gmail.com');

        san.nextTick(function () {
            expect(watchTriggerTimes).toBe(2);
            expect(emailTriggerTimes).toBe(1);

            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('erik168@163.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })

    });
});

