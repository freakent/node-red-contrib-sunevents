const helper = require("node-red-node-test-helper")
const SunEventsNode = require("../sun-events-node.js")

const test_lat = 37.53
const test_lng =  -122.26

describe('sun-events Node', function () {
    beforeEach(function (done) {
        jasmine.clock().install()
        helper.startServer(done);
    });

    afterEach(function (done) {
        jasmine.clock().uninstall()
        helper.unload()
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        let flow = [{ id: "n1", type: "sun-events", name: "test name" }]
        helper.load(SunEventsNode, flow, function () {
            try {
                var n1 = helper.getNode("n1")
                expect(n1).toEqual(jasmine.objectContaining({ name: 'test name' }))
                done()
            } catch (err) {
                done(err)
            }
        });
    });

    it('should initialise a set of sun events', function (done) {
        var flow = [{ id: "n1", type: "sun-events", name: "test name", wires: [["n2"]] },
        { id: "n2", type: "helper" }];
        helper.load(SunEventsNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            n2.on("input", function (msg) {
                try {
                    expect(msg.payload).toEqual({ lat: test_lat, lng: test_lng, sunevent: 'nadir'})
                    done();    
                } catch(err) {
                    done(err)
                }
            });
            n1.receive({ payload: {lat: test_lat, lng: test_lng }});
            jasmine.clock().tick(1000 * 60 * 60 * 24)
        });
    });
});