package com.ssafy.hellojob.domain.coverletter.entity;

import com.ssafy.hellojob.global.common.domain.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "chat_log")
public class ChatLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_log_id")
    private Integer chatLogId;

    @Column(name = "chat_log_content", columnDefinition = "TEXT", nullable = false)
    private String chatLogContent;

    @Column(name = "updated_count", nullable = false)
    @ColumnDefault("0")
    private Integer updatedCount = 0;

    @Builder
    public ChatLog(Integer chatLogId, String chatLogContent, Integer updatedCount) {
        this.chatLogId = chatLogId;
        this.chatLogContent = chatLogContent;
        this.updatedCount = updatedCount;
    }
}
