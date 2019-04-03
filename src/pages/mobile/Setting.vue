<template lang="pug">
    div
        q-page.text-center.bold
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
            name: 'TEST',
        };
    },
    created() {},
};
</script>
