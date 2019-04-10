export function bellApi () {
    return {
        query: gql`query {
            notifications(limit: 10){
                date
                subject{
                    name
                    thumbUrl(preferWidth: 50, preferHeight: 50)
                }
                object{
                    type
                    name
                    thumbUrl(preferWidth:50,preferHeight:50)
                }
                action
                actionValue
            }
        }`
    }
}

export function newsApi ([from, limit, direction]) {
    const pagination = { from, limit, direction }

    return {
        query: gql`query($pagination: PaginationInput!, $preferWidth: Int!, $preferHeight: Int!) {
            newsFeed(pagination: $pagination){
                oid
                type
                name
                thumbUrl(preferWidth: $preferWidth, preferHeight:$preferHeight)
            }
        }`,
        variables: {
            pagination: pagination,
            preferWidth: 370,
            preferHeight: 420
        }
    }
}

export function nodeCountersApi(oids) {
    return {
        query: gql`query($oids: [OID!]!){
            objectsFull(oids: $oids){
                oid
                type
                name
                ...on Node{
                    rate
                    rateUser
                    viewed
                    chainCnt
                    author{
                        oid
                        name
                        thumbUrl(preferWidth:50, preferHeight:50)
                    }
                }
            }
        }`,
        variables: {
            oids,
        }
    }
}

export function nodeFullApi(oids) {
    return {
        query: gql`query($oids: [OID!]!){
            objectsFull(oids: $oids){
                oid
                type
                name
                isSubscribed
                createdAt
                updatedAt
                ... on Node {
                    thumbUrl(preferWidth:378, preferHeight:400)
                    name
                    hashTags{
                        type
                        name
                    }
                    author{
                        oid
                        name
                        thumbUrl(preferWidth:50, preferHeight:50)
                    }
                    fragmentRoot{
                        content{
                            oid
                            thumbUrl(preferWidth:378, preferHeight:200)
                        }
                    }
                    fragmentSecondary{
                        content{
                            oid
                            thumbUrl(preferWidth:378, preferHeight:200)
                        }
                    }
                }
            }
        }`,
        variables: {
            oids,
        }
    }
}

export function isUserAuthorizedApi () {
    return {
        query: gql`query {
            query{
                userIsAuthorized
            }
        }`
    }
}

export function isUserConfirmedApi () {
    return {
        query: gql`query {
            userIsConfirmed
        }`
    }
}

export function listAuthActionsApi () {
    return {
        query: gql`query {
            AuthActions{
                action
                url
                params
            }
        }`
    }
}
