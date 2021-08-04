import {Heading, Layout, Page} from "@shopify/polaris";
import {useEffect, useState} from "react";
import { ScheduledEventCard } from '../component/scheduled-event-card';
import {FinishedEventCardProps, LiveEventCardProps, ScheduledEventCardProps} from "../interface/event-card.props";
import {LiveEvent, LiveStatus} from "../entities/live-event.entity";
import {LiveEventCard} from "../component/live-event-card";
import { FinishedEventCard } from '../component/finished-event-card';
import {useHistory} from "react-router-dom";
import httpClient from "../client/http-client";
import { LiveEventsResponse } from "../response/live-event.response";
import { ProductsResponse } from "../response/product.response";

export function LiveEventDashboard() {
    const history = useHistory();

    const [scheduledEventCards, setScheduledEventCards] = useState<ScheduledEventCardProps[]>();
    const [liveEventCards, setLiveEventCards] = useState<LiveEventCardProps[]>();
    const [finishedEventCards, setFinishedEventCards] = useState<FinishedEventCardProps[]>();

    /* reRender 변수는 Event Card의 수정, 삭제 등의 변화가 일어날 경우, 컴포넌트를 리렌더링하기 위한 변수이다.
       외부 라이브러리를 사용하지 않고, 매 번 상태를 찾아서 변화시키기보다는 데이터 최신화를 위해 컴포넌트를 리렌더링한다.
    */
    const [reRender, setReRender] = useState<boolean>(false);
    useEffect(() => {
        /* unmounted 변수는 cleanup을 위한 변수이다. 컴포넌트가 unmounted 됬을 때, true로 변화하며 상태 변화를 중지시킨다. */
        let unmounted = false;
        /* getLiveEventList 함수는 http api를 통해서 비동기적으로 서버로부터 Live Event List 데이터를 가져와,
           setState를 통해 상태를 변화시킨다.
        */
        async function getLiveEventList() {
            try {
                const { products } : ProductsResponse = await httpClient.getProduct();
                const { liveEvents } : LiveEventsResponse = await httpClient.getLiveEventList();
                
                const { scheduled, live, finished } = liveEvents.reduce((result: any, liveEvent: LiveEvent) => {
                    const event = { event: liveEvent };
                    const product = {products: products.filter(product => liveEvent.productIds.includes(product.id))};
                    let method;
                    switch(liveEvent.status) {
                        case LiveStatus.SCHEDULED:
                            method = {onDeleteAction, onLiveEventAction};
                            const scheduledEventCard: ScheduledEventCardProps = Object.assign(event, product, method);
                            result.scheduled.push(scheduledEventCard);
                            break;
                        case LiveStatus.LIVE:
                            method = {onDeleteAction, onFinishedEventAction};
                            const liveEventCard: LiveEventCardProps = Object.assign(event, product, method);
                            result.live.push(liveEventCard);
                            break;
                        case LiveStatus.FINISHED:
                            method = {onDeleteAction};
                            const finishedEventCard: FinishedEventCardProps = Object.assign(event, product, method);
                            result.finished.push(finishedEventCard);
                            break;
                    }
                    return result;
                }, {
                    scheduled: [],
                    live: [],
                    finished: [],
                })
                if(!unmounted) {
                    setScheduledEventCards(() => scheduled);
                    setLiveEventCards(() => live);
                    setFinishedEventCards(() => finished);
                }
            }
            catch(e) {
                console.log(e);
            }
        }
        getLiveEventList();
        return () => { unmounted = true };
    }, [reRender]);

    const onDeleteAction = async (id: string) => {
        const isSuccess = await httpClient.deleteLiveEvent(id);
        setReRender((prev) => !prev);
        if(isSuccess) console.log('delete Event Card');
    }
    const onLiveEventAction = async (id: string) => {
        const isSuccess = await httpClient.updateLiveEvent(id, { status : LiveStatus.LIVE });
        setReRender((prev) => !prev);
        if(isSuccess) console.log('change Live Event Card');
    }
    const onFinishedEventAction = async (id: string) => {
        const isSuccess = await httpClient.updateLiveEvent(id, { status : LiveStatus.FINISHED });
        setReRender((prev) => !prev);
        if(isSuccess) console.log('change Finished Event Card');
    }

    return (
        <Page title={'이벤트 대시보드'} fullWidth secondaryActions={[{
            content: '라이브 쇼핑 페이지로 이동', onAction: () => {
                window.location.href = '/live-shopping-page'
            }
        }]} primaryAction={{
            content: '새 이벤트 생성하기', onAction: () => {
                history.push('create-live-event')
            }
        }}>
            <Layout>
                <Layout.Section oneThird>
                    <Heading>방송 대기중인 이벤트</Heading>
                    {scheduledEventCards?.map((scheduledEventCard: ScheduledEventCardProps) => 
                        <ScheduledEventCard key={scheduledEventCard.event.id} 
                                        event={scheduledEventCard.event}
                                        products={scheduledEventCard.products}
                                        onDeleteAction={scheduledEventCard.onDeleteAction}
                                        onLiveEventAction={scheduledEventCard.onLiveEventAction}
                        />
                    )}
                </Layout.Section>
                <Layout.Section oneThird>
                    <Heading>방송 중인 이벤트</Heading>
                    {liveEventCards?.map((liveEventCard: LiveEventCardProps) => 
                        <LiveEventCard key={liveEventCard.event.id}
                                        event={liveEventCard.event}
                                        products={liveEventCard.products}
                                        onDeleteAction={liveEventCard.onDeleteAction}
                                        onFinishedEventAction={liveEventCard.onFinishedEventAction}
                        />
                    )}
                </Layout.Section>
                <Layout.Section oneThird>
                    <Heading>방송 종료된 이벤트</Heading>
                    {finishedEventCards?.map((finishedEventCard: FinishedEventCardProps) => 
                        <FinishedEventCard key={finishedEventCard.event.id}
                                        event={finishedEventCard.event}
                                        products={finishedEventCard.products}
                                        onDeleteAction={finishedEventCard.onDeleteAction}
                        />
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    )
}
