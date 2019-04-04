<template lang="pug">
    div
        q-page.text-center.bold
            q-btn(@click="getItems" :label="query")
            settings-item
</template>

<script>
import Settings from '../../components/Settings';

export default {
    components: {
        'settings-item': Settings,
    },
    data() {
        return {
            name: 'Setting',
        };
    },
    methods: {},
    mounted() {},
};
</script>
