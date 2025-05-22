package com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request;

import com.ssafy.hellojob.domain.coverlettercontent.dto.request.ChatRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EditContentDto {
    private int content_number;
    private String content_question;
    private int content_length;
    private String user_message;
    private String cover_letter;

    public static EditContentDto from(CoverLetterContent content, ChatRequestDto requestDto) {
        return EditContentDto.builder()
                .content_number(content.getContentNumber())
                .content_question(content.getContentQuestion())
                .content_length(content.getContentLength())
                .user_message(requestDto.getUserMessage())
                .cover_letter(requestDto.getContentDetail())
                .build();
    }
}
