<template lang="pug">
  q-page.flex.kp-notify__list
    q-card.kp-notify__item(flat bordered v-for="(items, ix) in bells" :key="ix")
        q-avatar.kp-notify__avatar
            img(:src="item.subject.thumbUrl")
        div.kp__notify__text.text-faded
            router-link.text-light-blue-7(to="#") {{ item.subject.name }}&nbsp;
            span &nbsp;{{ item.action | verbose }}&nbsp;
            router-link.text-light-blue-7(to='#') {{ item.object.name }}
            span &nbsp;как "{{ item.actionValue | format }}"
            div.kp-notify__date {{ item.date | date }}
    <!--div.border-grey-->
    <!-- q-card.kp-notify__item(flat bordered v-for="(item,ix) in notifs" :key="ix")
        q-avatar.kp-notify__avatar
            img(:src="item.user.avatar")
        div.kp__notify__text.text-faded
            router-link.text-light-blue-7(to="#") {{ item.user.name }}&nbsp;
            span оценил(а) близость к сути ядра&nbsp;
            router-link.text-light-blue-7(to='#') {{ item.node.name }}
            span &nbsp;как "{{ item.node.score }}"
            div.kp-notify__date {{ item.date }} -->
</template>

<style lang="stylus">
    .kp-notify
        &__list
            padding 4px
            display grid
            grid-template-columns 1fr

            grid-row-gap 4px

        &__item
            display grid
            padding 4px 8px
            grid-template-columns 48px auto
            min-height 50px

        &__text
            line-height 1.2 !important
            font-size 14px

        &__avatar
            display block
            float left
            width 32px
            height 32px
            margin 4px
            & img
                border-radius 32px
        &__date
            color silver
            font-size 10px
        .listBell
            background red
            width 40px
            height 40px
.border-grey
    width 100%
    height 22px
    background #ccc
</style>

<script>
import { mapState } from 'vuex'
import BellProvider from '../../store/api/BellProvider';

/* const NOTIFS = [
    { id: 1, date: 'вчера в 5:01', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Ольга' }, node: { id: 1, name: 'Звезды', score: 'Точно да' } },
    { id: 2, date: 'вчера в 6:30', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Лена Чижикова' }, node: { id: 1, name: 'Политика', score: 'Скорее нет' } },
    { id: 3, date: 'вчера в 9:54', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Ната' }, node: { id: 1, name: 'Огурцы', score: 'Точно нет' } },
    { id: 4, date: 'вчера в 12:33', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Тамара Бурцева' }, node: { id: 1, name: 'Безмятежность', score: 'Точно да' } },
    { id: 5, date: 'вчера в 16:42', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Галенька' }, node: { id: 1, name: 'Энергия', score: 'Точно нет' } },
    { id: 6, date: 'вчера в 19:20', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Ми Ми' }, node: { id: 1, name: 'Простые вещи', score: 'Точно да' } },
    { id: 7, date: 'вчера в 21:54', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Красотка' }, node: { id: 1, name: 'Балерина', score: 'Может быть' } },
    { id: 8, date: 'сегодня в 0:14', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Жанка' }, node: { id: 1, name: 'Сапожки', score: 'Скорее нет' } },
    { id: 9, date: 'сегодня в 9:54', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Вера Иванова' }, node: { id: 1, name: 'Полет птицы', score: 'Может быть' } },
    { id: 10, date: 'сегодня в 10:09', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Лариса Ивановна' }, node: { id: 1, name: 'Города', score: 'Точно да' } },
    { id: 11, date: 'сегодня в 11:02', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Клара' }, node: { id: 1, name: 'Фантастика', score: 'Скорее нет' } },
    { id: 12, date: 'завтра в 1:17', user: { avatar: 'https://cdn.quasar-framework.org/img/avatar2.jpg', name: 'Конфетка' }, node: { id: 1, name: 'Быт', score: 'Точно нет' } },
]; */

export default {
  name: 'PageMobileBell',
    data() {
      return {
/*
          notifs: NOTIFS.reverse(),
*/
          bells: []
      };
    },
    filters: {
        date: (val) => {
            if (!window.Intl) return val;
            if (!(val instanceof Date)) {
                let date = val;
                val = new Date(val);
                if (val === 'Дата некорректна') return date;
            }
            return new Intl.DateTimeFormat().format(val);
        },
        verbose: (act) => {
            let value = '';
            switch (act) {
                case 'CREATE':
                    value = 'создал(а) ядро';
                    break;
                case 'SUBSCRIBE':
                    value = 'подписался(ась) на...';
                    break;
                case 'RATE':
                    value = 'оценил(а) близость к сути';
                    break;
                default:
                    break;
            }
            return value;
        },
        format: (x) => {
            let z = '';
            (x === null) ? z = '0' : z = x;
            return z;
        },
    },
    computed: {
        ...mapState('providers', { provider: state => state.notifications }),
    },
    beforeMount() {
        this.appendBell();
    },
    methods: {
        load(data) {
            const self = this;
            data.forEach(el => this.bells.push(el));
        },
        appendBell() {
            this.provider.request()
                .then(this.load)
        },
    },
};
</script>
