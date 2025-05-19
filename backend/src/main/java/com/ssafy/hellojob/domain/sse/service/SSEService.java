package com.ssafy.hellojob.domain.sse.service;

import com.ssafy.hellojob.domain.user.service.UserReadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
@Slf4j
@RequiredArgsConstructor
public class SSEService {

    public record SseEventWrapper(String eventName, Object data) {}
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<Integer, Queue<SseEventWrapper>> retryQueue = new ConcurrentHashMap<>();

    private final UserReadService userReadService;

    public void addEmitter(Integer userId, SseEmitter emitter) {
        userReadService.findUserByIdOrElseThrow(userId);

        emitters.put(userId, emitter);

        // 연결 종료 시 emitter 제거
        emitter.onCompletion(() -> {
            log.debug("SSE 연결 정상 종료");
            emitters.remove(userId);
        });
        emitter.onTimeout(() -> {
            log.debug("SSE 타임아웃으로 연결 종료");
            emitters.remove(userId);
        });
        emitter.onError(e -> {
            log.warn("SSE 연결 중 에러 발생", e);
            emitters.remove(userId);
        });
    }

    public SseEmitter getEmitter(Integer userId) {
        return emitters.get(userId);
    }

    public void sendToUser(Integer userId, String eventName, Object data) {
        userReadService.findUserByIdOrElseThrow(userId);
        // 일단 큐에 넣음
        queueEvent(userId, eventName, data);
        SseEmitter emitter = getEmitter(userId);
        if(emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
                // 해당 이벤트 큐에서 제거
                removeTargetEvent(userId, eventName, data);
            } catch (IOException e) {
                // 연결이 끊긴 경우
                log.warn("❌ SSE 연결 실패 - userId={}, 원인={}", userId, e.getMessage());
                log.debug("실패한 sse 큐에 보관");
                emitter.completeWithError(e);
                emitters.remove(userId);
            }
        } else {
            log.debug("🔇 연결 없음 - userId = {}, 큐에 보관", userId);
        }
    }

    public void queueEvent(Integer userId, String eventName, Object data) {
        retryQueue
                .computeIfAbsent(userId, k -> new ConcurrentLinkedDeque<>())
                .add(new SseEventWrapper(eventName, data));
    }

    // 클라이언트 재접속 시 큐에 저장한 event 재실행
    public void replayQueuedEvents(Integer userId, SseEmitter emitter) {
        log.debug("▶️ replayQueuedEvents 시작");
        Queue<SseEventWrapper> queue = retryQueue.get(userId);

        if (queue != null && !queue.isEmpty()) {
        log.debug("▶️ userId={}, 큐 크기={}", userId, queue.size());
            while (!queue.isEmpty()) {
                SseEventWrapper event = queue.peek();
                try {
                    emitter.send(SseEmitter.event()
                            .name(event.eventName())
                            .data(event.data()));
                    queue.poll(); // 전송 성공 시에만 꺼냄
                } catch (IOException e) {
                    log.warn("❌ SSE 연결 재실패 - 중단");
                    emitter.completeWithError(e);
                    emitters.remove(userId);
                    break;
                }
            }
        }
    }

    // 주기적으로 ping 전송(sse 연결 끊기지 않도록)
    @Scheduled(fixedRate = 60_000) // 1분마다
    public void sendPingToAll() {
        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("ping")
                        .data("keep-alive"));
            } catch (IOException e) {
                log.warn("❌ SSE 연결 실패 - userId={}, 원인={}", userId, e.getMessage());
                emitter.completeWithError(e);
                emitters.remove(userId);
            }
        });
    }

    public void removeTargetEvent(Integer userId, String eventName, Object data) {
        SseEventWrapper target = new SseEventWrapper(eventName, data);
        Queue<SseEventWrapper> queue = retryQueue.get(userId);
        if (queue != null && !queue.isEmpty()) {
            boolean removed = queue.removeIf(e -> e.equals(target));
            if (removed) {
                log.debug("✅ 큐에서 이벤트 제거됨 - userId={}, eventName={}", userId, eventName);
            } else {
                log.debug("⚠️ 큐에 해당 이벤트 없음 - userId={}, eventName={}", userId, eventName);
            }
        }
    }
}
