define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal'], function ($, _, Twig, Modal) {
    var CustomWidget = function () {
        var self = this;

        this.getTemplate = _.bind(function (template, params, callback) {
            params = (typeof params == 'object') ? params : {};
            template = template || '';

            return this.render({
                href: '/templates/' + template + '.twig',
                base_path: this.params.path,
                v: this.get_version(),
                load: callback
            }, params);
        }, this);

        self.add_notify = function (mess) {
            var w_name = self.i18n('widget').name,
                date_now = Math.ceil(Date.now() / 1000),
                lang = self.i18n('settings'),
                n_data = {
                    from: mess.from,
                    to: mess.to,
                    duration: mess.duration,
                    text: mess.text,
                    date: date_now
                };

            if (mess.element && mess.element.id && mess.element.type) {
                n_data.element = mess.element;
            }

            AMOCRM.notifications.add_call(n_data);
        };

        this.callbacks = {
            render: function () {

                console.log('render');



                return true;
            },
            init: _.bind(function () {

                if(!$('#vl-meet-btn').length) {
                    self.getTemplate('menu_item', {}, (template) => {
                        let btn = template.render();
                        console.log(btn);
                        self.btn = btn;
                        $('#nav_menu').append(btn);
                    });
                }

                console.log('init');

                $(document).on('click', '.vl-js-save', () => {
                    let date = $('#vl-date').val();
                    console.log(date);
                    let dateArr = date.split('.');
                    date = new Date(dateArr.reverse().join('-'));
                    let seconds = date.getTime() / 1000;

                    let a = false;

                    $('.js-vl-user').each((index, item) => {
                        if($(item).prop("checked")) {

                            let data = [{
                                responsible_user_id: parseInt($(item).val()),
                                task_type_id: 2,
                                text: "Встреча",
                                complete_till: seconds
                            }];

                            $.ajax({
                                type: "POST",
                                contentType: "application/json",
                                url: '/api/v4/tasks',
                                data: JSON.stringify(data),
                                dataType: "json",
                                success: function(res) {
                                    if(!a) {
                                        $('.modal-window').remove();
                                        if(res._embedded.tasks[0].id) {
                                            a = true;
                                        }
                                    }
                                }
                            });
                        }
                    });
                });

                $(document).on('click', '#vl-meet-btn', (event) => {
                    event.preventDefault();

                    $.get('/api/v4/users', (res) => {
                        let users = res._embedded.users;

                        // кнопка сохранить
                        let btn = self.render({ref: '/tmpl/controls/button.twig'}, {
                            class_name: 'vl-js-save',
                            text: 'Создать'
                        });

                        let dateField = self.render({ref: '/tmpl/controls/date_field.twig'}, {
                            input_class: 'vl-js-date',
                            placeholder: 'Дата встречи'
                        });

                        // список пользователей
                        let usersList = [];
                        users.forEach((user) => {
                            if(user.rights.is_active) {
                                usersList.push(self.render({ref: '/tmpl/controls/checkbox.twig'}, {
                                    text: user.name,
                                    value: user.id,
                                    input_class_name: 'js-vl-user'
                                }));
                            }
                        });

                        // открыть окно
                        self.getTemplate('modal', {usersList, btn, dateField}, (template) => {
                            let data = template.render({usersList, btn, dateField});
                            let modal = new Modal({
                                class_name: 'modal-window',
                                init: function ($modal_body) {
                                    var $this = $(this);
                                    $modal_body
                                        .trigger('modal:loaded') // запускает отображение модального окна
                                        .html(data)
                                        .trigger('modal:centrify')  // настраивает модальное окно
                                        .append('');
                                },
                                destroy: function () {
                                }
                            });
                        });
                    });

                });

                return true;
            }, this),
            bind_actions: _.bind(function () {

                return true;
            }, this),

            settings: function () {
                return true;
            },
            onSave: function () {

                return true;
            },
            destroy: function () {

            },
            contacts: {
                //select contacts in list and clicked on widget name
                selected: function () {

                }
            },
            leads: {
                //select leads in list and clicked on widget name
                selected: function () {

                }
            },
            tasks: {
                //select taks in list and clicked on widget name
                selected: function () {

                }
            }
        };
        return this;
    };

    return CustomWidget;
});