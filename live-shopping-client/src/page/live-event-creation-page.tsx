import {
    ActionList,
    Button,
    Card,
    Form,
    FormLayout,
    Modal,
    Page,
    Popover,
    ResourceList,
    TextField, TextStyle, Thumbnail
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {LiveStatus} from "../entities/live-event.entity";
import {Product} from "../entities/product.entity";
import {useHistory} from "react-router-dom";
import httpClient from "../client/http-client";
import { CreateLiveEventDto } from "../dto/create-live-event.dto";

export function LiveEventCreationPage(){

    const history = useHistory();

    useEffect(() => {
        /* getProduct 함수는 http api를 통해서 비동기적으로 서버로부터 product 데이터를 가져와,
           setState를 통해 상태를 변화시킨다.
        */
        async function getProduct() {
            try {
                const { products } = await httpClient.getProduct();
                setProducts(() => products);
            }
            catch(e) {
                console.log('서버로부터 데이터를 전송받을 수 없습니다.');
            }
        }
        getProduct();
    }, []);

    const [title, setTitle] = useState<string>('');
    const [status, setStatus] = useState<LiveStatus>(LiveStatus.SCHEDULED);
    
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    const [popoverActive, setPopoverActive] = useState<boolean>(false);
    const [modalActive, setModalActive] = useState<boolean>(false);

    const handleModalChange = useCallback(() => setModalActive(!modalActive), [modalActive]);
    /* handleSubmit 함수는 event를 argument로 받아와,
       addEvent 함수에 CreateLiveEventDto type의 title, status, productIds를 parameter로 넣어,
       이벤트를 등록하고, 이벤트 등록이 성공되었으면 dashboard 페이지로 라우팅됩니다.
    */
    const handleSubmit = useCallback(async (_event) => {
        _event.preventDefault();
        const event: CreateLiveEventDto = {
            title,
            status,
            productIds: selectedProducts
        };
        const isSuccess = await httpClient.addLiveEvent(event);
        if(isSuccess) history.push('list');
    }, [history, selectedProducts, status, title]);
    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    );
    const handleTitleChange = useCallback((value) => setTitle(value), []);
    /* handleStatusChange 함수는 LiveStatus 중 하나를 argument로 받아서, setState로 상태를 변화시킨다. */
    const handleStatusChange = useCallback((status: LiveStatus) => setStatus(() => status), []);
    /* createActionListItems 함수는 ActionList 컴포넌트의 Items에서 LiveStatus 중 하나를 argument로 받아,
       객체에 content와 onAction, active를 담아 생성하여 반환한다.*/
    const createActionListItems = (_status: LiveStatus) => {
        return { content: _status, onAction: () => handleStatusChange(_status), active: status === _status}
    }
    const popOverActivator = (
        <Button onClick={togglePopoverActive} disclosure>
            이벤트 선택하기
        </Button>
    );
    const modalActivator = <Button onClick={handleModalChange}>상품 선택하기</Button>;

    return (
        <Page title={'이벤트 생성 페이지'} breadcrumbs={[{content: 'live event', onAction() {
                history.push('list')
            }}]}>
            <Card title={'이벤트 생성하기'}>
                <Card.Section>
                    <Form onSubmit={handleSubmit}>
                        <FormLayout>
                            <TextField
                                value={title}
                                onChange={handleTitleChange}
                                label="제목"
                                type="text"
                            />
                            <Popover
                                active={popoverActive}
                                activator={popOverActivator}
                                onClose={togglePopoverActive}
                            >
                                <ActionList items={[
                                    createActionListItems(LiveStatus.LIVE), 
                                    createActionListItems(LiveStatus.SCHEDULED), 
                                    createActionListItems(LiveStatus.FINISHED)]} 
                                />
                            </Popover>
                            <Modal
                                activator={modalActivator}
                                open={modalActive}
                                onClose={handleModalChange}
                                title="상품을 선택해주세요."
                                primaryAction={{
                                    content: '상품 추가 완료',
                                    onAction: handleModalChange,
                                }}
                            >
                                <Modal.Section>
                                    <ResourceList
                                        selectedItems={selectedProducts}
                                        onSelectionChange={(selectedItems: string[])=>{setSelectedProducts(selectedItems)}}
                                        selectable
                                        items={products.map((product) => ({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            media: (
                                                <Thumbnail
                                                    source={product.thumbnail}
                                                    alt={product.name}
                                                />
                                            ),

                                        }))}
                                        renderItem={(item) => {
                                            const {id, name, media, price} = item;
                                            return (
                                                <ResourceList.Item
                                                    id={id}
                                                    onClick={()=>{}}
                                                    media={media}
                                                    accessibilityLabel={`View details for ${name}`}
                                                >
                                                    <h3>
                                                        <TextStyle variation="strong">{name}</TextStyle>
                                                    </h3>
                                                    <div>￦{price}</div>
                                                </ResourceList.Item>
                                            );
                                        }}
                                    />
                                </Modal.Section>
                            </Modal>
                            <Button primary submit>이벤트 생성하기</Button>
                        </FormLayout>
                    </Form>
                </Card.Section>
            </Card>
        </Page>
    )
}
