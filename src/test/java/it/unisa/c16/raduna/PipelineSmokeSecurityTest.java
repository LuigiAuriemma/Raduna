package it.unisa.c16.raduna;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PipelineSmokeController.class)
@Import(PipelineSecurityConfiguration.class)
class PipelineSmokeSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void TF_SMOKE_03_getPipelineSmokeAllowsUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/pipeline-smoke"))
                .andExpect(status().isOk());
    }
}
