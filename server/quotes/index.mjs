// Kho câu nói — chỉ nằm trên server. Mỗi ngày client chỉ nhận đúng một câu.
import tanLam from './p1-tan-lam.mjs';
import hopKpi from './p2-hop-kpi.mjs';
import luong from './p3-luong.mjs';
import congTy from './p4-cong-ty.mjs';
import nghiViec from './p5-nghi-viec.mjs';

export const QUOTES = [...new Set([...tanLam, ...hopKpi, ...luong, ...congTy, ...nghiViec].map((q) => q.trim()))];
