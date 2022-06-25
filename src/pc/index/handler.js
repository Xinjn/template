module.exports = async ctx => {
    let json = [
        ['SmallBanner3:小banner3', 'KVProxy', 'getStructuredFragment', '260138'],
        ['Stars:中外明星', 'KVProxy', 'getStructuredFragment', '260139'],
        ['SmallBanner4:小banner4', 'KVProxy', 'getStructuredFragment', '260140'],
        ['PlaceList:奥运场馆', 'KVProxy', 'getStructuredFragment', '260141'],
    ];
    let allData = await transferV3(ctx, json);

    return { allData, adKeys: [] };
};
