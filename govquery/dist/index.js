(() => {
    "use strict";
    var e = {
        90: function(e, t, n) {
            var r = this && this.__importDefault || function(e) {
                return e && e.__esModule ? e : {
                    default: e
                };
            };
            Object.defineProperty(t, "__esModule", {
                value: !0
            }), t.ReferendumEvent = void 0;
            const a = r(n(613));
            t.ReferendumEvent = class {
                constructor(e) {
                    this.id = e;
                }
                get _name() {
                    return "ReferendumEvent";
                }
                async save() {
                    let e = this.id;
                    (0, a.default)(null !== e, "Cannot save ReferendumEvent entity without an ID"), 
                    await store.set("ReferendumEvent", e.toString(), this);
                }
                static async remove(e) {
                    (0, a.default)(null !== e, "Cannot remove ReferendumEvent entity without an ID"), 
                    await store.remove("ReferendumEvent", e.toString());
                }
                static async get(e) {
                    (0, a.default)(null != e, "Cannot get ReferendumEvent entity without an ID");
                    const t = await store.get("ReferendumEvent", e.toString());
                    return t ? this.create(t) : void 0;
                }
                static create(e) {
                    (0, a.default)("string" == typeof e.id, "id must be provided");
                    let t = new this(e.id);
                    return Object.assign(t, e), t;
                }
            };
        },
        170: function(e, t, n) {
            var r = this && this.__createBinding || (Object.create ? function(e, t, n, r) {
                void 0 === r && (r = n);
                var a = Object.getOwnPropertyDescriptor(t, n);
                a && !("get" in a ? !t.__esModule : a.writable || a.configurable) || (a = {
                    enumerable: !0,
                    get: function() {
                        return t[n];
                    }
                }), Object.defineProperty(e, r, a);
            } : function(e, t, n, r) {
                void 0 === r && (r = n), e[r] = t[n];
            }), a = this && this.__exportStar || function(e, t) {
                for (var n in e) "default" === n || Object.prototype.hasOwnProperty.call(t, n) || r(t, e, n);
            };
            Object.defineProperty(t, "__esModule", {
                value: !0
            }), a(n(625), t);
        },
        613: e => {
            e.exports = require("assert");
        },
        625: (e, t, n) => {
            Object.defineProperty(t, "__esModule", {
                value: !0
            }), t.TreasurySpend = t.ReferendumEvent = t.Referendum = void 0;
            var r = n(872);
            Object.defineProperty(t, "Referendum", {
                enumerable: !0,
                get: function() {
                    return r.Referendum;
                }
            });
            var a = n(90);
            Object.defineProperty(t, "ReferendumEvent", {
                enumerable: !0,
                get: function() {
                    return a.ReferendumEvent;
                }
            });
            var i = n(670);
            Object.defineProperty(t, "TreasurySpend", {
                enumerable: !0,
                get: function() {
                    return i.TreasurySpend;
                }
            });
        },
        670: function(e, t, n) {
            var r = this && this.__importDefault || function(e) {
                return e && e.__esModule ? e : {
                    default: e
                };
            };
            Object.defineProperty(t, "__esModule", {
                value: !0
            }), t.TreasurySpend = void 0;
            const a = r(n(613));
            t.TreasurySpend = class {
                constructor(e) {
                    this.id = e;
                }
                get _name() {
                    return "TreasurySpend";
                }
                async save() {
                    let e = this.id;
                    (0, a.default)(null !== e, "Cannot save TreasurySpend entity without an ID"), await store.set("TreasurySpend", e.toString(), this);
                }
                static async remove(e) {
                    (0, a.default)(null !== e, "Cannot remove TreasurySpend entity without an ID"), 
                    await store.remove("TreasurySpend", e.toString());
                }
                static async get(e) {
                    (0, a.default)(null != e, "Cannot get TreasurySpend entity without an ID");
                    const t = await store.get("TreasurySpend", e.toString());
                    return t ? this.create(t) : void 0;
                }
                static create(e) {
                    (0, a.default)("string" == typeof e.id, "id must be provided");
                    let t = new this(e.id);
                    return Object.assign(t, e), t;
                }
            };
        },
        872: function(e, t, n) {
            var r = this && this.__importDefault || function(e) {
                return e && e.__esModule ? e : {
                    default: e
                };
            };
            Object.defineProperty(t, "__esModule", {
                value: !0
            }), t.Referendum = void 0;
            const a = r(n(613));
            t.Referendum = class {
                constructor(e) {
                    this.id = e;
                }
                get _name() {
                    return "Referendum";
                }
                async save() {
                    let e = this.id;
                    (0, a.default)(null !== e, "Cannot save Referendum entity without an ID"), await store.set("Referendum", e.toString(), this);
                }
                static async remove(e) {
                    (0, a.default)(null !== e, "Cannot remove Referendum entity without an ID"), await store.remove("Referendum", e.toString());
                }
                static async get(e) {
                    (0, a.default)(null != e, "Cannot get Referendum entity without an ID");
                    const t = await store.get("Referendum", e.toString());
                    return t ? this.create(t) : void 0;
                }
                static create(e) {
                    (0, a.default)("string" == typeof e.id, "id must be provided");
                    let t = new this(e.id);
                    return Object.assign(t, e), t;
                }
            };
        }
    }, t = {};
    function n(r) {
        var a = t[r];
        if (void 0 !== a) return a.exports;
        var i = t[r] = {
            exports: {}
        };
        return e[r].call(i.exports, i, i.exports, n), i.exports;
    }
    var r = {};
    (() => {
        var e = r;
        Object.defineProperty(e, "__esModule", {
            value: !0
        }), e.handleBlock = async function(e) {}, e.handleReferendaEvent = async function(e) {
            const {event: n, block: r} = e, a = n.section, i = n.method;
            if ("referenda" !== a) return;
            const o = `${r.block.header.number.toString()}-${n.index}`, u = new t.ReferendumEvent(o);
            u.referendumId = function(e) {
                try {
                    const t = e.data;
                    if (!t) return;
                    for (const e of t) {
                        const t = e?.toHuman?.() ?? e;
                        if ("object" == typeof t && t && "index" in t) return String(t.index);
                        if ("object" == typeof t && t && "referendumIndex" in t) return String(t.referendumIndex);
                    }
                    for (const e of t) {
                        const t = Number(e);
                        if (!Number.isNaN(t)) return String(t);
                        const n = e?.toJSON?.(), r = Number(n);
                        if (!Number.isNaN(r)) return String(r);
                    }
                } catch {}
                return;
            }(n), u.section = a, u.method = i, u.blockHeight = r.block.header.number.toBigInt?.() ?? BigInt(r.block.header.number.toString()), 
            u.blockHash = r.block.hash.toString(), u.indexInBlock = "function" == typeof n.index?.toNumber ? n.index.toNumber() : Number(n.index?.toString?.() ?? n.index), 
            u.ts = new Date(r.timestamp ?? Date.now()), u.data = JSON.stringify(n.data?.toHuman?.() ?? n.data?.toJSON?.() ?? null), 
            await u.save();
            const s = u.referendumId ?? "unknown";
            if ("unknown" !== s) {
                const e = await t.Referendum.get(s) ?? new t.Referendum(s);
                try {
                    if ([ "Submitted", "SubmissionDepositPlaced" ].includes(i)) {
                        const t = await (api.query.referenda?.referendumInfoFor?.(s));
                        if (t?.isSome) {
                            const n = t.unwrap(), r = n?.ongoing?.track?.toNumber?.();
                            "number" == typeof r && (e.track = r);
                        }
                    }
                } catch (e) {
                    logger?.warn?.(`Failed pulling onchain referendum info for ${s}: ${e}`);
                }
                switch (i) {
                  case "Submitted":
                    e.submittedAt = new Date(u.ts);
                    break;

                  case "DecisionStarted":
                    e.decisionStartedAt = new Date(u.ts);
                    break;

                  case "Approved":
                    e.approvedAt = new Date(u.ts);
                    break;

                  case "Rejected":
                    e.rejectedAt = new Date(u.ts);
                    break;

                  case "Cancelled":
                    e.cancelledAt = new Date(u.ts);
                    break;

                  case "Killed":
                    e.killedAt = new Date(u.ts);
                }
                e.lastUpdatedAt = new Date(u.ts), await e.save();
            }
        };
        const t = n(170);
    })();
    var a = exports;
    for (var i in r) a[i] = r[i];
    r.__esModule && Object.defineProperty(a, "__esModule", {
        value: !0
    });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFDSGdDLEVBQUllLGNBQWMsSUFBSXJCLEtBQUsvQyxFQUFPOEM7b0JBQ2xDOztrQkFDRixLQUFLO29CQUNITyxFQUFJZ0Isb0JBQW9CLElBQUl0QixLQUFLL0MsRUFBTzhDO29CQUN4Qzs7a0JBQ0YsS0FBSztvQkFDSE8sRUFBSWlCLGFBQWEsSUFBSXZCLEtBQUsvQyxFQUFPOEM7b0JBQ2pDOztrQkFDRixLQUFLO29CQUNITyxFQUFJa0IsYUFBYSxJQUFJeEIsS0FBSy9DLEVBQU84QztvQkFDakM7O2tCQUNGLEtBQUs7b0JBQ0hPLEVBQUltQixjQUFjLElBQUl6QixLQUFLL0MsRUFBTzhDO29CQUNsQzs7a0JBQ0YsS0FBSztvQkFDSE8sRUFBSW9CLFdBQVcsSUFBSTFCLEtBQUsvQyxFQUFPOEM7O2dCQUtuQ08sRUFBSXFCLGdCQUFnQixJQUFJM0IsS0FBSy9DLEVBQU84QyxXQUM5Qk8sRUFBSTdEO0FBQ1o7QUFDRjtRQWpGQSIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5nb3Ytc3VicXVlcnkvLi9zcmMvdHlwZXMvbW9kZWxzL1JlZmVyZW5kdW1FdmVudC50cyIsIndlYnBhY2s6Ly9vcGVuZ292LXN1YnF1ZXJ5Ly4vc3JjL3R5cGVzL2luZGV4LnRzIiwid2VicGFjazovL29wZW5nb3Ytc3VicXVlcnkvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcImFzc2VydFwiIiwid2VicGFjazovL29wZW5nb3Ytc3VicXVlcnkvLi9zcmMvdHlwZXMvbW9kZWxzL2luZGV4LnRzIiwid2VicGFjazovL29wZW5nb3Ytc3VicXVlcnkvLi9zcmMvdHlwZXMvbW9kZWxzL1RyZWFzdXJ5U3BlbmQudHMiLCJ3ZWJwYWNrOi8vb3Blbmdvdi1zdWJxdWVyeS8uL3NyYy90eXBlcy9tb2RlbHMvUmVmZXJlbmR1bS50cyIsIndlYnBhY2s6Ly9vcGVuZ292LXN1YnF1ZXJ5L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29wZW5nb3Ytc3VicXVlcnkvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQXV0by1nZW5lcmF0ZWQgLCBETyBOT1QgRURJVFxuaW1wb3J0IHtFbnRpdHksIEZ1bmN0aW9uUHJvcGVydHlOYW1lc30gZnJvbSBcIkBzdWJxbC90eXBlc1wiO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5cblxuXG5leHBvcnQgdHlwZSBSZWZlcmVuZHVtRXZlbnRQcm9wcyA9IE9taXQ8UmVmZXJlbmR1bUV2ZW50LCBOb25OdWxsYWJsZTxGdW5jdGlvblByb3BlcnR5TmFtZXM8UmVmZXJlbmR1bUV2ZW50Pj58ICdfbmFtZSc+O1xuXG5leHBvcnQgY2xhc3MgUmVmZXJlbmR1bUV2ZW50IGltcGxlbWVudHMgRW50aXR5IHtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cblxuXG4gICAgcHVibGljIGlkOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgcmVmZXJlbmR1bUlkPzogc3RyaW5nO1xuXG4gICAgcHVibGljIHNlY3Rpb24/OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgbWV0aG9kPzogc3RyaW5nO1xuXG4gICAgcHVibGljIHN0YXR1cz86IHN0cmluZztcblxuICAgIHB1YmxpYyBibG9ja0hlaWdodD86IGJpZ2ludDtcblxuICAgIHB1YmxpYyBibG9ja0hhc2g/OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgaW5kZXhJbkJsb2NrPzogbnVtYmVyO1xuXG4gICAgcHVibGljIHRzPzogRGF0ZTtcblxuICAgIHB1YmxpYyBkYXRhPzogc3RyaW5nO1xuXG4gICAgcHVibGljIGFyZ3M/OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgY2FsbEFyZ3NKc29uPzogc3RyaW5nO1xuXG4gICAgcHVibGljIGRldGFpbHNKc29uPzogc3RyaW5nO1xuXG4gICAgcHVibGljIGV4dHJpbnNpY0hhc2g/OiBzdHJpbmc7XG5cblxuICAgIGdldCBfbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ1JlZmVyZW5kdW1FdmVudCc7XG4gICAgfVxuXG4gICAgYXN5bmMgc2F2ZSgpOiBQcm9taXNlPHZvaWQ+e1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBhc3NlcnQoaWQgIT09IG51bGwsIFwiQ2Fubm90IHNhdmUgUmVmZXJlbmR1bUV2ZW50IGVudGl0eSB3aXRob3V0IGFuIElEXCIpO1xuICAgICAgICBhd2FpdCBzdG9yZS5zZXQoJ1JlZmVyZW5kdW1FdmVudCcsIGlkLnRvU3RyaW5nKCksIHRoaXMpO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlKGlkOnN0cmluZyk6IFByb21pc2U8dm9pZD57XG4gICAgICAgIGFzc2VydChpZCAhPT0gbnVsbCwgXCJDYW5ub3QgcmVtb3ZlIFJlZmVyZW5kdW1FdmVudCBlbnRpdHkgd2l0aG91dCBhbiBJRFwiKTtcbiAgICAgICAgYXdhaXQgc3RvcmUucmVtb3ZlKCdSZWZlcmVuZHVtRXZlbnQnLCBpZC50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgZ2V0KGlkOnN0cmluZyk6IFByb21pc2U8UmVmZXJlbmR1bUV2ZW50IHwgdW5kZWZpbmVkPntcbiAgICAgICAgYXNzZXJ0KChpZCAhPT0gbnVsbCAmJiBpZCAhPT0gdW5kZWZpbmVkKSwgXCJDYW5ub3QgZ2V0IFJlZmVyZW5kdW1FdmVudCBlbnRpdHkgd2l0aG91dCBhbiBJRFwiKTtcbiAgICAgICAgY29uc3QgcmVjb3JkID0gYXdhaXQgc3RvcmUuZ2V0KCdSZWZlcmVuZHVtRXZlbnQnLCBpZC50b1N0cmluZygpKTtcbiAgICAgICAgaWYgKHJlY29yZCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUocmVjb3JkIGFzIFJlZmVyZW5kdW1FdmVudFByb3BzKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgc3RhdGljIGNyZWF0ZShyZWNvcmQ6IFJlZmVyZW5kdW1FdmVudFByb3BzKTogUmVmZXJlbmR1bUV2ZW50IHtcbiAgICAgICAgYXNzZXJ0KHR5cGVvZiByZWNvcmQuaWQgPT09ICdzdHJpbmcnLCBcImlkIG11c3QgYmUgcHJvdmlkZWRcIik7XG4gICAgICAgIGxldCBlbnRpdHkgPSBuZXcgdGhpcyhyZWNvcmQuaWQpO1xuICAgICAgICBPYmplY3QuYXNzaWduKGVudGl0eSxyZWNvcmQpO1xuICAgICAgICByZXR1cm4gZW50aXR5O1xuICAgIH1cbn1cbiIsIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG5cbi8vIEF1dG8tZ2VuZXJhdGVkICwgRE8gTk9UIEVESVRcbmV4cG9ydCAqIGZyb20gXCIuL21vZGVsc1wiOyBcblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImFzc2VydFwiKTsiLCIvLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuXG4vLyBBdXRvLWdlbmVyYXRlZCAsIERPIE5PVCBFRElUXG5cbmV4cG9ydCB7UmVmZXJlbmR1bX0gZnJvbSBcIi4vUmVmZXJlbmR1bVwiXG5cbmV4cG9ydCB7UmVmZXJlbmR1bUV2ZW50fSBmcm9tIFwiLi9SZWZlcmVuZHVtRXZlbnRcIlxuXG5leHBvcnQge1RyZWFzdXJ5U3BlbmR9IGZyb20gXCIuL1RyZWFzdXJ5U3BlbmRcIlxuXG4iLCIvLyBBdXRvLWdlbmVyYXRlZCAsIERPIE5PVCBFRElUXG5pbXBvcnQge0VudGl0eSwgRnVuY3Rpb25Qcm9wZXJ0eU5hbWVzfSBmcm9tIFwiQHN1YnFsL3R5cGVzXCI7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cblxuXG5cbmV4cG9ydCB0eXBlIFRyZWFzdXJ5U3BlbmRQcm9wcyA9IE9taXQ8VHJlYXN1cnlTcGVuZCwgTm9uTnVsbGFibGU8RnVuY3Rpb25Qcm9wZXJ0eU5hbWVzPFRyZWFzdXJ5U3BlbmQ+PnwgJ19uYW1lJz47XG5cbmV4cG9ydCBjbGFzcyBUcmVhc3VyeVNwZW5kIGltcGxlbWVudHMgRW50aXR5IHtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cblxuXG4gICAgcHVibGljIGlkOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgcmVmZXJlbmR1bUlkPzogc3RyaW5nO1xuXG4gICAgcHVibGljIGJsb2NrSGVpZ2h0PzogYmlnaW50O1xuXG4gICAgcHVibGljIGJsb2NrSGFzaD86IHN0cmluZztcblxuICAgIHB1YmxpYyBldmVudE1ldGhvZD86IHN0cmluZztcblxuICAgIHB1YmxpYyBhbW91bnQ/OiBiaWdpbnQ7XG5cbiAgICBwdWJsaWMgYmVuZWZpY2lhcnk/OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgYXJncz86IHN0cmluZztcblxuICAgIHB1YmxpYyBjcmVhdGVkQXQ/OiBEYXRlO1xuXG4gICAgcHVibGljIHVwZGF0ZWRBdD86IERhdGU7XG5cbiAgICBwdWJsaWMgZXh0cmluc2ljSGFzaD86IHN0cmluZztcblxuXG4gICAgZ2V0IF9uYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnVHJlYXN1cnlTcGVuZCc7XG4gICAgfVxuXG4gICAgYXN5bmMgc2F2ZSgpOiBQcm9taXNlPHZvaWQ+e1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkO1xuICAgICAgICBhc3NlcnQoaWQgIT09IG51bGwsIFwiQ2Fubm90IHNhdmUgVHJlYXN1cnlTcGVuZCBlbnRpdHkgd2l0aG91dCBhbiBJRFwiKTtcbiAgICAgICAgYXdhaXQgc3RvcmUuc2V0KCdUcmVhc3VyeVNwZW5kJywgaWQudG9TdHJpbmcoKSwgdGhpcyk7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyByZW1vdmUoaWQ6c3RyaW5nKTogUHJvbWlzZTx2b2lkPntcbiAgICAgICAgYXNzZXJ0KGlkICE9PSBudWxsLCBcIkNhbm5vdCByZW1vdmUgVHJlYXN1cnlTcGVuZCBlbnRpdHkgd2l0aG91dCBhbiBJRFwiKTtcbiAgICAgICAgYXdhaXQgc3RvcmUucmVtb3ZlKCdUcmVhc3VyeVNwZW5kJywgaWQudG9TdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGdldChpZDpzdHJpbmcpOiBQcm9taXNlPFRyZWFzdXJ5U3BlbmQgfCB1bmRlZmluZWQ+e1xuICAgICAgICBhc3NlcnQoKGlkICE9PSBudWxsICYmIGlkICE9PSB1bmRlZmluZWQpLCBcIkNhbm5vdCBnZXQgVHJlYXN1cnlTcGVuZCBlbnRpdHkgd2l0aG91dCBhbiBJRFwiKTtcbiAgICAgICAgY29uc3QgcmVjb3JkID0gYXdhaXQgc3RvcmUuZ2V0KCdUcmVhc3VyeVNwZW5kJywgaWQudG9TdHJpbmcoKSk7XG4gICAgICAgIGlmIChyZWNvcmQpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKHJlY29yZCBhcyBUcmVhc3VyeVNwZW5kUHJvcHMpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICBzdGF0aWMgY3JlYXRlKHJlY29yZDogVHJlYXN1cnlTcGVuZFByb3BzKTogVHJlYXN1cnlTcGVuZCB7XG4gICAgICAgIGFzc2VydCh0eXBlb2YgcmVjb3JkLmlkID09PSAnc3RyaW5nJywgXCJpZCBtdXN0IGJlIHByb3ZpZGVkXCIpO1xuICAgICAgICBsZXQgZW50aXR5ID0gbmV3IHRoaXMocmVjb3JkLmlkKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihlbnRpdHkscmVjb3JkKTtcbiAgICAgICAgcmV0dXJuIGVudGl0eTtcbiAgICB9XG59XG4iLCIvLyBBdXRvLWdlbmVyYXRlZCAsIERPIE5PVCBFRElUXG5pbXBvcnQge0VudGl0eSwgRnVuY3Rpb25Qcm9wZXJ0eU5hbWVzfSBmcm9tIFwiQHN1YnFsL3R5cGVzXCI7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cblxuXG5cbmV4cG9ydCB0eXBlIFJlZmVyZW5kdW1Qcm9wcyA9IE9taXQ8UmVmZXJlbmR1bSwgTm9uTnVsbGFibGU8RnVuY3Rpb25Qcm9wZXJ0eU5hbWVzPFJlZmVyZW5kdW0+PnwgJ19uYW1lJz47XG5cbmV4cG9ydCBjbGFzcyBSZWZlcmVuZHVtIGltcGxlbWVudHMgRW50aXR5IHtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cblxuXG4gICAgcHVibGljIGlkOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgdHJhY2s/OiBudW1iZXI7XG5cbiAgICBwdWJsaWMgc3RhdHVzPzogc3RyaW5nO1xuXG4gICAgcHVibGljIGNyZWF0ZWRBdD86IERhdGU7XG5cbiAgICBwdWJsaWMgbGFzdFNlZW5BdD86IERhdGU7XG5cbiAgICBwdWJsaWMgbGFzdFN0YXR1cz86IHN0cmluZztcblxuICAgIHB1YmxpYyBsYXN0U3RhdHVzQXQ/OiBEYXRlO1xuXG4gICAgcHVibGljIHN1Ym1pdHRlZEF0PzogRGF0ZTtcblxuICAgIHB1YmxpYyBjb25maXJtU3RhcnRlZEF0PzogRGF0ZTtcblxuICAgIHB1YmxpYyBkZWNpc2lvblN0YXJ0ZWRBdD86IERhdGU7XG5cbiAgICBwdWJsaWMgYXBwcm92ZWRBdD86IERhdGU7XG5cbiAgICBwdWJsaWMgcmVqZWN0ZWRBdD86IERhdGU7XG5cbiAgICBwdWJsaWMgZXhlY3V0ZWRBdD86IERhdGU7XG5cbiAgICBwdWJsaWMgY2FuY2VsbGVkQXQ/OiBEYXRlO1xuXG4gICAgcHVibGljIGtpbGxlZEF0PzogRGF0ZTtcblxuICAgIHB1YmxpYyBleGVjdXRpb25PdXRjb21lPzogc3RyaW5nO1xuXG4gICAgcHVibGljIGxhc3RVcGRhdGVkQXQ/OiBEYXRlO1xuXG4gICAgcHVibGljIGJsb2NrSGFzaExhc3Q/OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgZXh0cmluc2ljSGFzaExhc3Q/OiBzdHJpbmc7XG5cblxuICAgIGdldCBfbmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ1JlZmVyZW5kdW0nO1xuICAgIH1cblxuICAgIGFzeW5jIHNhdmUoKTogUHJvbWlzZTx2b2lkPntcbiAgICAgICAgbGV0IGlkID0gdGhpcy5pZDtcbiAgICAgICAgYXNzZXJ0KGlkICE9PSBudWxsLCBcIkNhbm5vdCBzYXZlIFJlZmVyZW5kdW0gZW50aXR5IHdpdGhvdXQgYW4gSURcIik7XG4gICAgICAgIGF3YWl0IHN0b3JlLnNldCgnUmVmZXJlbmR1bScsIGlkLnRvU3RyaW5nKCksIHRoaXMpO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlKGlkOnN0cmluZyk6IFByb21pc2U8dm9pZD57XG4gICAgICAgIGFzc2VydChpZCAhPT0gbnVsbCwgXCJDYW5ub3QgcmVtb3ZlIFJlZmVyZW5kdW0gZW50aXR5IHdpdGhvdXQgYW4gSURcIik7XG4gICAgICAgIGF3YWl0IHN0b3JlLnJlbW92ZSgnUmVmZXJlbmR1bScsIGlkLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBnZXQoaWQ6c3RyaW5nKTogUHJvbWlzZTxSZWZlcmVuZHVtIHwgdW5kZWZpbmVkPntcbiAgICAgICAgYXNzZXJ0KChpZCAhPT0gbnVsbCAmJiBpZCAhPT0gdW5kZWZpbmVkKSwgXCJDYW5ub3QgZ2V0IFJlZmVyZW5kdW0gZW50aXR5IHdpdGhvdXQgYW4gSURcIik7XG4gICAgICAgIGNvbnN0IHJlY29yZCA9IGF3YWl0IHN0b3JlLmdldCgnUmVmZXJlbmR1bScsIGlkLnRvU3RyaW5nKCkpO1xuICAgICAgICBpZiAocmVjb3JkKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShyZWNvcmQgYXMgUmVmZXJlbmR1bVByb3BzKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgc3RhdGljIGNyZWF0ZShyZWNvcmQ6IFJlZmVyZW5kdW1Qcm9wcyk6IFJlZmVyZW5kdW0ge1xuICAgICAgICBhc3NlcnQodHlwZW9mIHJlY29yZC5pZCA9PT0gJ3N0cmluZycsIFwiaWQgbXVzdCBiZSBwcm92aWRlZFwiKTtcbiAgICAgICAgbGV0IGVudGl0eSA9IG5ldyB0aGlzKHJlY29yZC5pZCk7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZW50aXR5LHJlY29yZCk7XG4gICAgICAgIHJldHVybiBlbnRpdHk7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IFN1YnN0cmF0ZUV2ZW50LCBTdWJzdHJhdGVCbG9jayB9IGZyb20gXCJAc3VicWwvdHlwZXNcIjtcbmltcG9ydCB7IFJlZmVyZW5kdW0sIFJlZmVyZW5kdW1FdmVudCB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8vIFN1YlF1ZXJ5IGluamVjdHMgYGFwaWAgYW5kIGBsb2dnZXJgIGdsb2JhbHMgYXQgcnVudGltZTpcbmRlY2xhcmUgY29uc3QgYXBpOiBhbnk7XG5kZWNsYXJlIGNvbnN0IGxvZ2dlcjogYW55O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlQmxvY2soYmxvY2s6IFN1YnN0cmF0ZUJsb2NrKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIEp1c3QgYSBwbGFjZWhvbGRlciB0byBkZW1vbnN0cmF0ZSBibG9jayBoYW5kbGVyXG4gIC8vIFlvdSBjb3VsZCBzdG9yZSBjaGFpbi1sZXZlbCBpbmZvIGhlcmUgaWYgbmVlZGVkLlxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVmZXJlbmRhRXZlbnQoZXZ0OiBTdWJzdHJhdGVFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IGV2ZW50LCBibG9jayB9ID0gZXZ0O1xuICBjb25zdCBzZWN0aW9uID0gZXZlbnQuc2VjdGlvbjtcbiAgY29uc3QgbWV0aG9kID0gZXZlbnQubWV0aG9kO1xuXG4gIC8vIE9ubHkgcHJvY2VzcyByZWZlcmVuZGEgcGFsbGV0IGV2ZW50c1xuICBpZiAoc2VjdGlvbiAhPT0gXCJyZWZlcmVuZGFcIikgcmV0dXJuO1xuXG4gIGNvbnN0IGlkID0gYCR7YmxvY2suYmxvY2suaGVhZGVyLm51bWJlci50b1N0cmluZygpfS0ke2V2ZW50LmluZGV4fWA7XG4gIGNvbnN0IGVudGl0eSA9IG5ldyBSZWZlcmVuZHVtRXZlbnQoaWQpO1xuICBlbnRpdHkucmVmZXJlbmR1bUlkID0gZXh0cmFjdFJlZmVyZW5kdW1JZChldmVudCk7XG4gIGVudGl0eS5zZWN0aW9uID0gc2VjdGlvbjtcbiAgZW50aXR5Lm1ldGhvZCA9IG1ldGhvZDtcbiAgZW50aXR5LmJsb2NrSGVpZ2h0ID0gYmxvY2suYmxvY2suaGVhZGVyLm51bWJlci50b0JpZ0ludD8uKClcbiAgPz8gQmlnSW50KGJsb2NrLmJsb2NrLmhlYWRlci5udW1iZXIudG9TdHJpbmcoKSk7XG4gIGVudGl0eS5ibG9ja0hhc2ggPSBibG9jay5ibG9jay5oYXNoLnRvU3RyaW5nKCk7XG4gIGVudGl0eS5pbmRleEluQmxvY2sgPSB0eXBlb2YgKGV2ZW50LmluZGV4IGFzIGFueSk/LnRvTnVtYmVyID09PSAnZnVuY3Rpb24nXG4gID8gKGV2ZW50LmluZGV4IGFzIGFueSkudG9OdW1iZXIoKVxuICA6IE51bWJlcigoZXZlbnQuaW5kZXggYXMgYW55KT8udG9TdHJpbmc/LigpID8/IGV2ZW50LmluZGV4KTtcbiAgZW50aXR5LnRzID0gbmV3IERhdGUoYmxvY2sudGltZXN0YW1wID8/IERhdGUubm93KCkpO1xuICBlbnRpdHkuZGF0YSA9IEpTT04uc3RyaW5naWZ5KGV2ZW50LmRhdGE/LnRvSHVtYW4/LigpID8/IGV2ZW50LmRhdGE/LnRvSlNPTj8uKCkgPz8gbnVsbCk7XG4gIGF3YWl0IGVudGl0eS5zYXZlKCk7XG5cbiAgLy8gTWFpbnRhaW4gYSBzaW1wbGUgUmVmZXJlbmR1bSByb3cgd2l0aCBiYXNpYyB0aW1lc3RhbXBzIGZvciBjb21tb24gc3RhdGVzXG4gIGNvbnN0IHJlZklkID0gZW50aXR5LnJlZmVyZW5kdW1JZCA/PyBcInVua25vd25cIjtcbiAgaWYgKHJlZklkICE9PSBcInVua25vd25cIikge1xuICAgIGNvbnN0IHJlZiA9IChhd2FpdCBSZWZlcmVuZHVtLmdldChyZWZJZCkpID8/IG5ldyBSZWZlcmVuZHVtKHJlZklkKTtcbiAgICAvLyBUcnkgdG8gZW5yaWNoIHdpdGggdHJhY2svZGVwb3NpdHMgd2hlbiB3ZSBzZWUgYSByZWxldmFudCBldmVudFxuICAgIHRyeSB7XG4gICAgICBpZiAoW1wiU3VibWl0dGVkXCIsIFwiU3VibWlzc2lvbkRlcG9zaXRQbGFjZWRcIl0uaW5jbHVkZXMobWV0aG9kKSkge1xuICAgICAgICAvLyBQdWxsIHRyYWNrL2RlcCBmcm9tIGNoYWluIHN0b3JhZ2Ugd2hlbiBhdmFpbGFibGVcbiAgICAgICAgLy8gTm90ZTogT3BlbkdvdiBzdG9yYWdlIHBhdGhzIGRpZmZlciBieSBydW50aW1lLCBzbyBrZWVwIHRoaXMgZGVmZW5zaXZlXG4gICAgICAgIC8vIElmIHRoZSBiZWxvdyBmYWlscyBpdCB3b24ndCBjcmFzaCB0aGUgaW5kZXhlci5cbiAgICAgICAgY29uc3Qgb25jaGFpbiA9IGF3YWl0IGFwaS5xdWVyeS5yZWZlcmVuZGE/LnJlZmVyZW5kdW1JbmZvRm9yPy4ocmVmSWQpO1xuICAgICAgICBpZiAob25jaGFpbj8uaXNTb21lKSB7XG4gICAgICAgICAgY29uc3QgaW5mbyA9IG9uY2hhaW4udW53cmFwKCk7XG4gICAgICAgICAgLy8gdHJhY2tJZCBmb3VuZCB1bmRlciAub25nb2luZy50cmFjayAoY29tbW9uIG9uIHJlY2VudCBydW50aW1lcylcbiAgICAgICAgICBjb25zdCB0cmFjayA9IGluZm8/Lm9uZ29pbmc/LnRyYWNrPy50b051bWJlcj8uKCk7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0cmFjayA9PT0gXCJudW1iZXJcIikgcmVmLnRyYWNrID0gdHJhY2s7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXI/Lndhcm4/LihgRmFpbGVkIHB1bGxpbmcgb25jaGFpbiByZWZlcmVuZHVtIGluZm8gZm9yICR7cmVmSWR9OiAke2V9YCk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgXCJTdWJtaXR0ZWRcIjpcbiAgICAgICAgcmVmLnN1Ym1pdHRlZEF0ID0gbmV3IERhdGUoZW50aXR5LnRzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRGVjaXNpb25TdGFydGVkXCI6XG4gICAgICAgIHJlZi5kZWNpc2lvblN0YXJ0ZWRBdCA9IG5ldyBEYXRlKGVudGl0eS50cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFwcHJvdmVkXCI6XG4gICAgICAgIHJlZi5hcHByb3ZlZEF0ID0gbmV3IERhdGUoZW50aXR5LnRzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiUmVqZWN0ZWRcIjpcbiAgICAgICAgcmVmLnJlamVjdGVkQXQgPSBuZXcgRGF0ZShlbnRpdHkudHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJDYW5jZWxsZWRcIjpcbiAgICAgICAgcmVmLmNhbmNlbGxlZEF0ID0gbmV3IERhdGUoZW50aXR5LnRzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiS2lsbGVkXCI6XG4gICAgICAgIHJlZi5raWxsZWRBdCA9IG5ldyBEYXRlKGVudGl0eS50cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJlZi5sYXN0VXBkYXRlZEF0ID0gbmV3IERhdGUoZW50aXR5LnRzKTtcbiAgICBhd2FpdCByZWYuc2F2ZSgpO1xuICB9XG59XG5cbi8vIFRyeSB0byBleHRyYWN0IGEgcmVmZXJlbmR1bSBpbmRleCBmcm9tIGNvbW1vbiBldmVudCBhcmcgcG9zaXRpb25zXG5mdW5jdGlvbiBleHRyYWN0UmVmZXJlbmR1bUlkKGV2ZW50OiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIC8vIENvbW1vbiBsYXlvdXRzOlxuICAgIC8vIFN1Ym1pdHRlZChJbmRleCwgVHJhY2tJZCwgLi4uKVxuICAgIC8vIERlY2lzaW9uU3RhcnRlZChJbmRleCwgLi4uKVxuICAgIC8vIEFwcHJvdmVkKEluZGV4KVxuICAgIC8vIFJlamVjdGVkKEluZGV4KVxuICAgIC8vIE5vdGU6IGV2ZW50LmRhdGEgbWF5IGJlIFZlYzxDb2RlYz4gd2l0aCBvYmplY3RzIG9yIHByaW1pdGl2ZXMgZGVwZW5kaW5nIG9uIG1ldGFkYXRhXG4gICAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgaWYgKCFkYXRhKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgLy8gUHJlZmVyIGZpZWxkcyB3aXRoIG9idmlvdXMgbmFtZXNcbiAgICBmb3IgKGNvbnN0IGQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgaCA9IGQ/LnRvSHVtYW4/LigpID8/IGQ7XG4gICAgICBpZiAodHlwZW9mIGggPT09IFwib2JqZWN0XCIgJiYgaCAmJiAoXCJpbmRleFwiIGluIGgpKSByZXR1cm4gU3RyaW5nKGguaW5kZXgpO1xuICAgICAgaWYgKHR5cGVvZiBoID09PSBcIm9iamVjdFwiICYmIGggJiYgKFwicmVmZXJlbmR1bUluZGV4XCIgaW4gaCkpIHJldHVybiBTdHJpbmcoaC5yZWZlcmVuZHVtSW5kZXgpO1xuICAgIH1cbiAgICAvLyBGYWxsYmFjazogZmlyc3QgbnVtZXJpYy1sb29raW5nIGFyZ1xuICAgIGZvciAoY29uc3QgZCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBuID0gTnVtYmVyKGQpO1xuICAgICAgaWYgKCFOdW1iZXIuaXNOYU4obikpIHJldHVybiBTdHJpbmcobik7XG4gICAgICBjb25zdCBqID0gZD8udG9KU09OPy4oKTtcbiAgICAgIGNvbnN0IG4yID0gTnVtYmVyKGopO1xuICAgICAgaWYgKCFOdW1iZXIuaXNOYU4objIpKSByZXR1cm4gU3RyaW5nKG4yKTtcbiAgICB9XG4gIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIl0sIm5hbWVzIjpbImNvbnN0cnVjdG9yIiwiaWQiLCJ0aGlzIiwiX25hbWUiLCJzYXZlIiwic3RvcmUiLCJzZXQiLCJ0b1N0cmluZyIsInJlbW92ZSIsImdldCIsInJlY29yZCIsImNyZWF0ZSIsImVudGl0eSIsIk9iamVjdCIsImFzc2lnbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXF1aXJlIiwiUmVmZXJlbmR1bSIsIlJlZmVyZW5kdW1FdmVudCIsIlRyZWFzdXJ5U3BlbmQiLCJfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18iLCJfX3dlYnBhY2tfcmVxdWlyZV9fIiwibW9kdWxlSWQiLCJjYWNoZWRNb2R1bGUiLCJ1bmRlZmluZWQiLCJfX3dlYnBhY2tfbW9kdWxlc19fIiwiY2FsbCIsImFzeW5jIiwiYmxvY2siLCJldnQiLCJldmVudCIsInNlY3Rpb24iLCJtZXRob2QiLCJoZWFkZXIiLCJudW1iZXIiLCJpbmRleCIsInJlZmVyZW5kdW1JZCIsImRhdGEiLCJkIiwiaCIsInRvSHVtYW4iLCJTdHJpbmciLCJyZWZlcmVuZHVtSW5kZXgiLCJuIiwiTnVtYmVyIiwiaXNOYU4iLCJqIiwidG9KU09OIiwibjIiLCJleHRyYWN0UmVmZXJlbmR1bUlkIiwiYmxvY2tIZWlnaHQiLCJ0b0JpZ0ludCIsIkJpZ0ludCIsImJsb2NrSGFzaCIsImhhc2giLCJpbmRleEluQmxvY2siLCJ0b051bWJlciIsInRzIiwiRGF0ZSIsInRpbWVzdGFtcCIsIm5vdyIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZWZJZCIsInJlZiIsImluY2x1ZGVzIiwib25jaGFpbiIsImFwaSIsInF1ZXJ5IiwicmVmZXJlbmRhIiwicmVmZXJlbmR1bUluZm9Gb3IiLCJpc1NvbWUiLCJpbmZvIiwidW53cmFwIiwidHJhY2siLCJvbmdvaW5nIiwiZSIsImxvZ2dlciIsIndhcm4iLCJzdWJtaXR0ZWRBdCIsImRlY2lzaW9uU3RhcnRlZEF0IiwiYXBwcm92ZWRBdCIsInJlamVjdGVkQXQiLCJjYW5jZWxsZWRBdCIsImtpbGxlZEF0IiwibGFzdFVwZGF0ZWRBdCJdLCJzb3VyY2VSb290IjoiIn0=